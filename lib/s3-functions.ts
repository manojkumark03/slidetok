// S3 Vector Integration Functions for TikTok Slide Generator
// These functions handle image and hook retrieval from S3 vector buckets

export interface ImageResult {
  key: string
  score: number
  source_url: string
  notes?: string
  tags?: string[]
}

export interface HookResult {
  key: string
  score: number
  text: string
  notes?: string
  tags?: string[]
}

// Mock implementation for development - replace with actual S3 vector integration
export async function getImages(query: string, topK = 8): Promise<ImageResult[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock data for development
  const mockImages: ImageResult[] = [
    {
      key: "images/modern-app-ui-1.jpg",
      score: 0.95,
      source_url: "/modern-mobile-app-interface-with-gradient-backgrou.jpg",
      notes: "Modern mobile app UI with gradient",
      tags: ["ui", "mobile", "app", "gradient"],
    },
    {
      key: "images/social-media-mockup.jpg",
      score: 0.88,
      source_url: "/social-media-app-mockup-on-phone-screen.jpg",
      notes: "Social media app mockup",
      tags: ["social", "mockup", "phone"],
    },
    {
      key: "images/app-store-screenshot.jpg",
      score: 0.82,
      source_url: "/app-store-download-screen-with-ratings.jpg",
      notes: "App store download screen",
      tags: ["app-store", "download", "ratings"],
    },
    {
      key: "images/user-testimonial.jpg",
      score: 0.79,
      source_url: "/happy-user-with-phone-showing-app-success.jpg",
      notes: "User testimonial photo",
      tags: ["testimonial", "user", "success"],
    },
  ]

  return mockImages.slice(0, topK)
}

export async function getHooks(query: string, topK = 5): Promise<HookResult[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Mock hook data for development
  const mockHooks: HookResult[] = [
    {
      key: "hooks/fomo-pricing-1",
      score: 0.92,
      text: "Stop paying $50/month for apps that don't work",
      notes: "FOMO pricing hook",
      tags: ["fomo", "pricing", "pain-point"],
    },
    {
      key: "hooks/viral-social-proof",
      score: 0.89,
      text: "10M+ users can't be wrong about this app",
      notes: "Social proof viral hook",
      tags: ["social-proof", "viral", "numbers"],
    },
    {
      key: "hooks/problem-solution",
      score: 0.85,
      text: "The app that finally solves your biggest problem",
      notes: "Problem-solution hook",
      tags: ["problem", "solution", "relief"],
    },
    {
      key: "hooks/urgency-scarcity",
      score: 0.83,
      text: "Only 24 hours left to get this life-changing app",
      notes: "Urgency and scarcity hook",
      tags: ["urgency", "scarcity", "limited-time"],
    },
    {
      key: "hooks/transformation",
      score: 0.8,
      text: "How I went from struggling to thriving with one app",
      notes: "Personal transformation hook",
      tags: ["transformation", "personal", "success"],
    },
  ]

  return mockHooks.slice(0, topK)
}

export async function uploadImage(filePath: string, notes?: string, tags?: string[]): Promise<string> {
  // Simulate upload delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Mock upload response
  const mockUrl = `https://mock-s3-bucket.s3.us-east-1.amazonaws.com/images/${Date.now()}-${filePath.split("/").pop()}`
  return mockUrl
}
