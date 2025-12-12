import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportFormat = 'csv' | 'pdf';

interface ExportColumn {
    header: string;
    key: string;
    formatter?: (value: any) => string;
}

export const downloadCSV = (data: any[], columns: ExportColumn[], filename: string) => {
    const headers = columns.map(c => c.header).join(',');
    const rows = data.map(item =>
        columns.map(col => {
            let val = item[col.key];
            if (col.formatter) val = col.formatter(item);
            // Escape quotes and wrap in quotes
            val = val?.toString().replace(/"/g, '""') || '';
            return `"${val}"`;
        }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const downloadPDF = (data: any[], columns: ExportColumn[], title: string, filename: string) => {
    const orientation = columns.length > 8 ? 'landscape' : 'portrait';
    const doc = new jsPDF({ orientation });

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    // Table
    const tableColumn = columns.map(c => c.header);
    const tableRows = data.map(item =>
        columns.map(col => {
            let val = item[col.key];
            if (col.formatter) val = col.formatter(item) || '';
            return val;
        })
    );

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 163, 74] }, // Green-600-ish
    });

    doc.save(`${filename}.pdf`);
};
