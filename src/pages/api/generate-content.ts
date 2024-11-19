import { NextApiRequest, NextApiResponse } from "next";
import { generateLearningContent } from "@/utils/ai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { topic, currentStage, previousContent, lastApiCall } = req.body;

    const content = await generateLearningContent(
      topic,
      currentStage,
      previousContent,
      lastApiCall
    );

    res.status(200).json({ content });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Error generating content" });
  }
}
