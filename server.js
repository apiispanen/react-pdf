const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const marked = require('marked').marked;  // Correct import of marked
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/generate-pdf', async (req, res) => {
  try {
    const { markdown } = req.body;

    // Convert Markdown to HTML
    const htmlContent = marked(markdown);
    const html = `<html><body>${htmlContent}</body></html>`;

    // Launch Puppeteer to generate the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],  // Use these flags for Linux environments
    });
    const page = await browser.newPage();
    await page.setContent(html);

    // Generate the PDF as a buffer
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });
    await browser.close();

    // Set the correct Content-Type for the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=document.pdf');  // Set as inline to open in a new tab
    res.end(pdfBuffer);  // Send the buffer directly
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
