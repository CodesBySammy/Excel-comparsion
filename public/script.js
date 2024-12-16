document.addEventListener('DOMContentLoaded', () => {
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    const compareBtn = document.getElementById('compareBtn');
    const compareColumnInput = document.getElementById('compareColumn');

    const matchedStudentsBody = document.getElementById('matchedStudents');
    const unmatchedStudentsBody1 = document.getElementById('unmatchedStudents1');
    const unmatchedStudentsBody2 = document.getElementById('unmatchedStudents2');

    const downloadMatchedBtn = document.getElementById('downloadMatched');
    const downloadUnmatched1Btn = document.getElementById('downloadUnmatched1');
    const downloadUnmatched2Btn = document.getElementById('downloadUnmatched2');

    let file1Data = [];
    let file2Data = [];

    file1Input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            file1Data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        };
        reader.readAsBinaryString(file);
    });

    file2Input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            file2Data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        };
        reader.readAsBinaryString(file);
    });

    compareBtn.addEventListener('click', () => {
        const compareColumn = compareColumnInput.value || 'Registration Number';
        
        // Reset previous results
        matchedStudentsBody.innerHTML = '';
        unmatchedStudentsBody1.innerHTML = '';
        unmatchedStudentsBody2.innerHTML = '';

        const matched = [];
        const unmatchedFile1 = [];
        const unmatchedFile2 = [];

        // Compare sheets
        file1Data.forEach(row1 => {
            const matchedRow = file2Data.find(row2 => 
                row1[compareColumn] === row2[compareColumn]
            );

            if (matchedRow) {
                matched.push(row1);
            } else {
                unmatchedFile1.push(row1);
            }
        });

        file2Data.forEach(row2 => {
            const matchedRow = file1Data.find(row1 => 
                row1[compareColumn] === row2[compareColumn]
            );

            if (!matchedRow) {
                unmatchedFile2.push(row2);
            }
        });

        // Display matched students
        matched.forEach(student => {
            const row = matchedStudentsBody.insertRow();
            row.insertCell().textContent = student[compareColumn];
        });

        // Display unmatched students from first file
        unmatchedFile1.forEach(student => {
            const row = unmatchedStudentsBody1.insertRow();
            row.insertCell().textContent = student[compareColumn];
        });

        // Display unmatched students from second file
        unmatchedFile2.forEach(student => {
            const row = unmatchedStudentsBody2.insertRow();
            row.insertCell().textContent = student[compareColumn];
        });

        // Show download buttons
        downloadMatchedBtn.style.display = matched.length > 0 ? 'block' : 'none';
        downloadUnmatched1Btn.style.display = unmatchedFile1.length > 0 ? 'block' : 'none';
        downloadUnmatched2Btn.style.display = unmatchedFile2.length > 0 ? 'block' : 'none';

        // Download functionality
        downloadMatchedBtn.onclick = () => downloadExcel(matched, 'matched_students.xlsx');
        downloadUnmatched1Btn.onclick = () => downloadExcel(unmatchedFile1, 'unmatched_file1.xlsx');
        downloadUnmatched2Btn.onclick = () => downloadExcel(unmatchedFile2, 'unmatched_file2.xlsx');
    });

    function downloadExcel(data, filename) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, filename);
    }
});