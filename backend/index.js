import express from 'express';
import cors from 'cors';
import fs from 'fs';
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit'; // PDF generation


const app = express();
const PORT = 4000;
app.use(express.json());
app.use(cors());

if (!fs.existsSync('./data.xlsx')) {
    const workbook = xlsx.utils.book_new();
    const initialSheet = xlsx.utils.json_to_sheet([]);
    xlsx.utils.book_append_sheet(workbook, initialSheet, "Sheet1");
    xlsx.writeFile(workbook, './data.xlsx');
}

app.post('/api/addDataToCsv', (req, res) => {
    try {
        const newData = req.body;
        const workbook = xlsx.readFile('./data.xlsx');
        console.log(newData);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const existingData = xlsx.utils.sheet_to_json(worksheet);

        const updatedData = existingData.concat(newData);
        const updatedWorksheet = xlsx.utils.json_to_sheet(updatedData);
        workbook.Sheets[sheetName] = updatedWorksheet;
        xlsx.writeFile(workbook, './data.xlsx');

        res.status(200).json({ message: "Data added successfully." });
    } catch (error) {
        console.error("Error writing to Excel file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post('/api/data', (req, res) => {
    try {
        const { name, subject, gender, group, bio, number } = req.body;

        const workbook = xlsx.readFile('./data.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const existingData = xlsx.utils.sheet_to_json(worksheet);
        const newData = { name, subject, gender, group, bio, number };
        existingData.push(newData);
        const updatedWorksheet = xlsx.utils.json_to_sheet(existingData);
        workbook.Sheets[sheetName] = updatedWorksheet;

        xlsx.writeFile(workbook, './data.xlsx');

        res.status(200).json({ message: "Data added successfully." });
    } catch (error) {
        console.error("Error writing to Excel file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

let data = [];

app.get('/api/downloadPdf', (req, res) => {
    try {
        const workbook = xlsx.readFile('./data.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        const doc = new PDFDocument({ margin: 30 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=data.pdf');

        
        doc.pipe(res);

      
        doc.fontSize(20).text('User Data Report', {
            align: 'center',
            underline: true,
        });

        doc.moveDown(2); 

        const tableHeaders = ['Name', 'Subject', 'Gender', 'Group', 'Bio', 'Number'];

        const tableColumnPositions = [50, 150, 250, 350, 450, 550];

        doc.fontSize(12).fillColor('black').font('Helvetica-Bold');
        tableHeaders.forEach((header, i) => {
            doc.text(header, tableColumnPositions[i], doc.y);
        });

        doc.moveDown(0.5); 
        doc.font('Helvetica').fontSize(10); 

        data.forEach((row, index) => {
            tableColumnPositions.forEach((pos, i) => {
                const fieldValue = [
                    row.name || '',
                    row.subject || '',
                    row.gender || '',
                    row.group || '',
                    row.bio || '',
                    row.number || '',
                ][i];

                doc.text(fieldValue, pos, doc.y);
            });
            doc.moveDown(1); 
        });

        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});


app.post('/api/editDataInCsv', (req, res) => {
    try {
        console.log(req.body);
        const newData = req.body;
        const workbook = xlsx.readFile('./data.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const updatedWorksheet = xlsx.utils.json_to_sheet(newData);
        workbook.Sheets[sheetName] = updatedWorksheet;
        xlsx.writeFile(workbook, './data.xlsx');

        res.status(200).json({ message: "Data added successfully." });
    } catch (error) {
        console.error("Error writing to Excel file:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get('/api/excelFile', (req, res) => {
    const workbook = xlsx.readFile('./data.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const existingData = xlsx.utils.sheet_to_json(worksheet);
    data.push(existingData);
    res.send(existingData);
})

app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
})