"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Image as ImageIcon, Archive, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ENDPOINTS } from "@/lib/api_config";

interface ResourceUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploaded: (resource: any) => void;
    uploaderId?: string | null;
    domains: string[];
}

export function ResourceUploadModal({ isOpen, onClose, onUploaded, uploaderId, domains }: ResourceUploadModalProps) {
    const [name, setName] = useState("");
    const [domain, setDomain] = useState(() => domains.find((d) => d !== "All") || "Olympiad");
    const [category, setCategory] = useState("Guide");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        setError(null);
        // Size limit: 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError("File size exceeds 5MB limit.");
            return;
        }
        // Specific types (optional check, but good for UX)
        // Accepting common types
        setFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploaderId) {
            setError("Please login to upload a resource.");
            return;
        }
        if (!name || !file || !domain || !subject) {
            setError("Please provide name, domain, subject, and a file.");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("uploader_id", uploaderId);
            formData.append("name", name);
            formData.append("domain", domain);
            formData.append("subject", subject);
            formData.append("category", category);
            formData.append("description", description);
            formData.append("file", file);

            const res = await fetch(ENDPOINTS.UPLOAD_RESOURCE, {
                method: "POST",
                body: formData,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || data?.status !== "success") {
                setError(data?.message || "Failed to upload resource.");
                return;
            }

            onUploaded(data.data);
            resetForm();
            onClose();
        } catch (e) {
            console.error(e);
            setError("Failed to upload resource.");
        } finally {
            setIsUploading(false);
        };
    };

    const resetForm = () => {
        setName("");
        setDomain(domains.find((d) => d !== "All") || "Olympiad");
        setCategory("Guide");
        setSubject("");
        setDescription("");
        setFile(null);
        setError(null);
        setIsDragging(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl z-[70] p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Upload className="w-5 h-5 text-accent2" /> Share Resource
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Resource Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent2 focus:outline-none transition-colors"
                                    placeholder="e.g., Ultimate Hackathon Guide"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Competition Domain</label>
                                <select
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent2 focus:outline-none transition-colors"
                                >
                                    {domains
                                        .filter((d) => d !== "All")
                                        .map((d) => (
                                            <option key={d} value={d}>
                                                {d}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent2 focus:outline-none transition-colors"
                                    >
                                        <option value="Guide">Guide</option>
                                        <option value="Template">Template</option>
                                        <option value="Rules">Rules</option>
                                        <option value="Assets">Assets</option>
                                            <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subject</label>
                                    <input
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent2 focus:outline-none transition-colors"
                                        placeholder="e.g., Math / Physics / Algorithms"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-accent2 focus:outline-none transition-colors h-24 resize-none"
                                    placeholder="Briefly describe what this resource contains..."
                                />
                            </div>

                            {/* File Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                className={cn(
                                    "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all",
                                    isDragging ? "border-accent2 bg-accent2/10" : "border-white/10 hover:border-white/30 hover:bg-white/5",
                                    file ? "border-green-500/50 bg-green-500/5" : ""
                                )}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf,.zip,.png,.jpg,.jpeg,.doc,.docx"
                                />

                                {file ? (
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-white">{file.name}</p>
                                        <p className="text-xs text-green-400 mt-1">Ready to upload</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-300 font-medium">Click to upload or drag & drop</p>
                                        <p className="text-xs text-gray-500 mt-1">PDF, ZIP, Images (Max 5MB)</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isUploading}
                                    className="flex-1 py-3 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="flex-1 py-3 rounded-lg bg-accent1 text-black font-bold hover:bg-white hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                >
                                    {isUploading ? "Uploading..." : "Upload Resource"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
