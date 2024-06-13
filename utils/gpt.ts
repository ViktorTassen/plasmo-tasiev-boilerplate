import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

export const getPricefromGPT = async (year, make, model, trim) => {
  const prompt = `Return the average price in the USA for a ${year} ${make} ${model} ${trim}, as number like "10000", no text`;

  try {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        max_tokens: 60,
        model: "gpt-4o",
    });

    const result = parseInt(completion.choices[0].message.content);
    console.log("getInt:", result);
    return result;

  } catch (error) {
    console.error("Error generating VIN:", error);
    return [];
  }
};
