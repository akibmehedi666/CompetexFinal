<?php
declare(strict_types=1);

/**
 * Centralized notification helpers.
 *
 * - Stores notifications in the `notifications` table (see competex_db.sql).
 * - Best-effort by default: failures are logged but do not throw unless caller decides.
 * - Supports both mysqli and PDO connections used across the API folder.
 */

function competex_uuidv4(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

/**
 * Insert a notification for a single user.
 * Returns the notification id on success, or null on failure.
 *
 * @param mysqli|PDO $db
 */
function competex_notify_user($db, string $userId, string $type, string $message, ?string $referenceId = null, ?string $createdAt = null): ?string
{
    $notificationId = competex_uuidv4();
    $createdAt = $createdAt ?: date('Y-m-d H:i:s');

    try {
        if ($db instanceof mysqli) {
            $stmt = $db->prepare("
                INSERT INTO notifications (id, user_id, reference_id, message, type, is_read, created_at)
                VALUES (?, ?, ?, ?, ?, 0, ?)
            ");
            if (!$stmt) {
                error_log("notifications: prepare failed: " . $db->error);
                return null;
            }
            $stmt->bind_param("ssssss", $notificationId, $userId, $referenceId, $message, $type, $createdAt);
            $ok = $stmt->execute();
            $stmt->close();
            return $ok ? $notificationId : null;
        }

        if ($db instanceof PDO) {
            $stmt = $db->prepare("
                INSERT INTO notifications (id, user_id, reference_id, message, type, is_read, created_at)
                VALUES (:id, :user_id, :reference_id, :message, :type, 0, :created_at)
            ");
            $ok = $stmt->execute([
                ":id" => $notificationId,
                ":user_id" => $userId,
                ":reference_id" => $referenceId,
                ":message" => $message,
                ":type" => $type,
                ":created_at" => $createdAt
            ]);
            return $ok ? $notificationId : null;
        }
    } catch (Throwable $e) {
        error_log("notifications: insert failed: " . $e->getMessage());
        return null;
    }

    error_log("notifications: unsupported db connection type");
    return null;
}

/**
 * Create notifications from a SELECT that yields:
 * - user_id
 * - reference_id
 * - message
 *
 * Returns affected row count, or 0 on failure.
 */
function competex_notify_from_select_mysqli(mysqli $conn, string $selectSql, string $selectTypes, array $selectParams, string $notificationType): int
{
    $insertSql = "
        INSERT INTO notifications (id, user_id, reference_id, message, type, is_read, created_at)
        SELECT UUID(), x.user_id, x.reference_id, x.message, ?, 0, CURRENT_TIMESTAMP
        FROM ( $selectSql ) AS x
    ";

    try {
        $stmt = $conn->prepare($insertSql);
        if (!$stmt) return 0;

        $bindTypes = "s" . $selectTypes;
        $bindParams = array_merge([$notificationType], $selectParams);
        $stmt->bind_param($bindTypes, ...$bindParams);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return max(0, (int)$affected);
    } catch (Throwable $e) {
        error_log("notifications: notify_from_select failed: " . $e->getMessage());
        return 0;
    }
}

/**
 * Mark notifications as read by (user_id, type, reference_id).
 *
 * @param mysqli|PDO $db
 */
function competex_mark_notification_read($db, string $userId, string $type, string $referenceId): bool
{
    try {
        if ($db instanceof mysqli) {
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ? AND type = ? AND reference_id = ?");
            if (!$stmt) return false;
            $stmt->bind_param("sss", $userId, $type, $referenceId);
            $ok = $stmt->execute();
            $stmt->close();
            return (bool)$ok;
        }

        if ($db instanceof PDO) {
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :user_id AND type = :type AND reference_id = :reference_id");
            return $stmt->execute([
                ":user_id" => $userId,
                ":type" => $type,
                ":reference_id" => $referenceId
            ]);
        }
    } catch (Throwable $e) {
        error_log("notifications: mark read failed: " . $e->getMessage());
        return false;
    }

    return false;
}

