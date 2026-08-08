function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}


function auditWebsite(url) {

  try {

    // Get Gemini API key securely from Script Properties
    const API_KEY = PropertiesService
      .getScriptProperties()
      .getProperty('GEMINI_API_KEY');

    if (!API_KEY) {
      throw new Error("Gemini API key was not found in Script Properties.");
    }


    // Basic URL validation
    if (!url || !url.trim()) {
      throw new Error("Please enter a website URL.");
    }


    const prompt = `
You are an expert SEO consultant.

The user has provided this website URL:

${url}

For this first version, provide an AI-assisted SEO review based on the website URL and general SEO best practices.

Create a professional report with these sections:

1. SEO Score (out of 100)

2. Meta Title Analysis

3. Meta Description Analysis

4. Heading Structure

5. Keyword Suggestions

6. Technical SEO Recommendations

7. Image Alt Text Suggestions

8. Internal Linking Suggestions

9. Top 5 SEO Recommendations

For every recommendation, briefly explain why it matters.

Clearly mention that this is an AI-assisted preliminary audit and that technical verification of the live webpage is required for definitive findings.

Keep the report concise, professional and easy to understand.
`;


    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent";


    const payload = {

      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]

    };


    const options = {

      method: "post",

      contentType: "application/json",

      headers: {
        "x-goog-api-key": API_KEY
      },

      payload: JSON.stringify(payload),

      muteHttpExceptions: true

    };


    const response = UrlFetchApp.fetch(endpoint, options);

    const responseText = response.getContentText();

    const statusCode = response.getResponseCode();


    // Show API error clearly
    if (statusCode < 200 || statusCode >= 300) {

      throw new Error(
        "Gemini API Error (" +
        statusCode +
        "): " +
        responseText
      );

    }


    const json = JSON.parse(responseText);


    if (
      !json.candidates ||
      !json.candidates[0] ||
      !json.candidates[0].content ||
      !json.candidates[0].content.parts
    ) {

      throw new Error(
        "Unexpected Gemini response: " +
        responseText
      );

    }


    return json.candidates[0].content.parts
      .map(function(part) {
        return part.text || "";
      })
      .join("\n");


  } catch (error) {

    return "ERROR: " + error.message;

  }

}
