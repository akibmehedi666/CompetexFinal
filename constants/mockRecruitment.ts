import { JobPosting, Shortlist } from "@/types";

export const MOCK_JOB_POSTINGS: JobPosting[] = [
    {
        id: "job1",
        recruiterId: "u4",
        recruiterName: "Rachel Recruiter",
        companyName: "TechHunters Agency",
        title: "Senior React Developer",
        description: "We're looking for an experienced React developer to join our team and build cutting-edge web applications. You'll work on challenging projects with modern tech stack.",
        requirements: [
            "5+ years of React experience",
            "Strong TypeScript skills",
            "Experience with Next.js",
            "Understanding of state management (Redux, Zustand)",
            "Excellent problem-solving skills"
        ],
        skills: ["React", "TypeScript", "Next.js", "Redux", "Node.js"],
        location: "San Francisco, CA (Hybrid)",
        type: "full-time",
        salary: "$120k - $180k",
        postedAt: "2026-01-10T09:00:00",
        deadline: "2026-02-10T23:59:59",
        applicationsCount: 12
    },
    {
        id: "job2",
        recruiterId: "u4",
        recruiterName: "Rachel Recruiter",
        companyName: "TechHunters Agency",
        title: "Product Manager",
        description: "Join our product team to define and execute product strategy for our flagship platform. Work closely with engineering, design, and stakeholders.",
        requirements: [
            "3+ years of product management experience",
            "Technical background preferred",
            "Strong analytical skills",
            "Experience with Agile methodologies",
            "Excellent communication skills"
        ],
        skills: ["Product Management", "Agile", "Data Analysis", "User Research"],
        location: "Remote",
        type: "full-time",
        salary: "$100k - $150k",
        postedAt: "2026-01-08T10:00:00",
        deadline: "2026-02-08T23:59:59",
        applicationsCount: 5
    },
    {
        id: "job3",
        recruiterId: "u4",
        recruiterName: "Rachel Recruiter",
        companyName: "StartupX",
        title: "Frontend Developer Intern",
        description: "Summer internship opportunity for passionate frontend developers. Learn from experienced engineers and work on real-world projects.",
        requirements: [
            "Currently pursuing CS degree",
            "Knowledge of HTML, CSS, JavaScript",
            "Familiarity with React or Vue",
            "Strong willingness to learn",
            "Good communication skills"
        ],
        skills: ["JavaScript", "React", "HTML", "CSS"],
        location: "New York, NY (On-site)",
        type: "internship",
        salary: "$25/hour",
        postedAt: "2026-01-05T14:00:00",
        deadline: "2026-01-30T23:59:59",
        applicationsCount: 28
    },
    {
        id: "job4",
        recruiterId: "u4",
        recruiterName: "Rachel Recruiter",
        companyName: "CloudTech Solutions",
        title: "DevOps Engineer",
        description: "We need a skilled DevOps engineer to manage our cloud infrastructure and CI/CD pipelines. Help us scale our platform to millions of users.",
        requirements: [
            "4+ years of DevOps experience",
            "Strong AWS/Azure/GCP knowledge",
            "Experience with Docker and Kubernetes",
            "CI/CD pipeline expertise",
            "Infrastructure as Code (Terraform, CloudFormation)"
        ],
        skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
        location: "Austin, TX (Hybrid)",
        type: "full-time",
        salary: "$110k - $160k",
        postedAt: "2026-01-12T11:00:00",
        deadline: "2026-02-15T23:59:59",
        applicationsCount: 8
    },
    {
        id: "job5",
        recruiterId: "u4",
        recruiterName: "Rachel Recruiter",
        companyName: "AI Innovations Inc",
        title: "Machine Learning Engineer",
        description: "Join our AI team to develop state-of-the-art machine learning models. Work on challenging problems in computer vision and NLP.",
        requirements: [
            "MS/PhD in CS or related field",
            "Strong Python and ML frameworks (PyTorch, TensorFlow)",
            "Experience with deep learning",
            "Published research is a plus",
            "Strong mathematical background"
        ],
        skills: ["Python", "PyTorch", "TensorFlow", "Deep Learning", "NLP"],
        location: "Boston, MA (On-site)",
        type: "full-time",
        salary: "$140k - $200k",
        postedAt: "2026-01-14T08:00:00",
        deadline: "2026-02-28T23:59:59",
        applicationsCount: 3
    }
];

export const MOCK_SHORTLISTS: Shortlist[] = [
    {
        id: "short1",
        recruiterId: "u4",
        candidateId: "u1",
        candidateName: "Alex Cyber",
        jobId: "job1",
        jobTitle: "Senior React Developer",
        notes: "Excellent hackathon performance. Strong React and cybersecurity background. Top candidate for the role.",
        status: "contacted",
        addedAt: "2026-01-13T10:00:00",
        lastContact: "2026-01-14T15:30:00",
        rating: 5
    },
    {
        id: "short2",
        recruiterId: "u4",
        candidateId: "candidate2",
        candidateName: "Sarah Chen",
        jobId: "job2",
        jobTitle: "Product Manager",
        notes: "Great communication skills demonstrated in team events. Technical background is a plus.",
        status: "interviewing",
        addedAt: "2026-01-11T14:00:00",
        lastContact: "2026-01-13T09:00:00",
        rating: 4
    },
    {
        id: "short3",
        recruiterId: "u4",
        candidateId: "candidate3",
        candidateName: "Mike Johnson",
        jobId: "job1",
        jobTitle: "Senior React Developer",
        notes: "Solid technical skills. Need to verify years of experience.",
        status: "interested",
        addedAt: "2026-01-12T16:00:00",
        rating: 4
    },
    {
        id: "short4",
        recruiterId: "u4",
        candidateId: "candidate4",
        candidateName: "Emily Rodriguez",
        jobId: "job5",
        jobTitle: "Machine Learning Engineer",
        notes: "PhD candidate with strong research background. Published papers in top conferences.",
        status: "offered",
        addedAt: "2026-01-09T11:00:00",
        lastContact: "2026-01-14T10:00:00",
        rating: 5
    }
];
