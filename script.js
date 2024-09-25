fetch('teacherData.json')
    .then(response => response.json())
    .then(teacherData => {
        document.getElementById('teacherForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const empCode = document.getElementById('empCode').value.trim();
            const department = document.getElementById('department').value.trim();
            const designation = document.getElementById('designation').value.trim();
            const resultDiv = document.getElementById('result');

            const normalizedEmpCode = empCode.replace(/\s+/g, '');

            const teacherDetails = teacherData.filter(t => {
                return (normalizedEmpCode === '' || t['EMP Code'].replace(/\s+/g, '') === normalizedEmpCode);
            });

            if (teacherDetails.length > 0) {
                const firstTeacher = teacherDetails[0];
                const teacherName = firstTeacher['Name of the teacher'] || 'Not Available';
                const dept = department || 'Not Provided';
                const empId = firstTeacher['EMP Code'] ? firstTeacher['EMP Code'].replace(/\s+/g, '') : 'Not Available';

                // Separate lab subjects and lecture subjects
                const labSubjects = teacherDetails.filter(teacher => /lab|laboratory/i.test(teacher['Name of the subject']));
                const lectureSubjects = teacherDetails.filter(teacher => !/lab|laboratory/i.test(teacher['Name of the subject']));

                let table = `<h2>Faculty Name: ${teacherName}</h2>
                             <h2>Department: ${dept}</h2>
                             <h2>Designation: ${designation}</h2>
                             <h2>Employee ID: ${empId}</h2>`;

                // Create Lecture Table if there are lecture subjects
                if (lectureSubjects.length > 0) {
                    table += `<h3>Theory Subjects</h3>
                              <table border="1">
                                  <thead>
                                      <tr>
                                          <th>Academic Year</th>
                                          <th>B. Tech. Year</th>
                                          <th>Sem</th>
                                          <th>Section</th>
                                          <th>Name of the subject</th>
                                          <th>No of Students Appeared</th>
                                          <th>No of Students Passed</th>
                                          <th>% of Pass</th>
                                      </tr>
                                  </thead>
                                  <tbody>`;

                    lectureSubjects.forEach(teacher => {
                        table += `<tr>
                                    <td>${teacher['Academic Year']}</td>
                                    <td>${teacher['B. Tech. Year']}</td>
                                    <td>${teacher['Sem']}</td>
                                    <td>${teacher['Section']}</td>
                                    <td>${teacher['Name of the subject']}</td>
                                    <td>${teacher['No of Students Appeared']}</td>
                                    <td>${teacher['No of Students passed']}</td>
                                    <td>${(parseFloat(teacher['% of Pass']) || 0).toFixed(2)}</td> 
                                  </tr>`;
                    });

                    table += `</tbody></table>`;
                }

                // Create Lab Table if there are lab subjects
                if (labSubjects.length > 0) {
                    table += `<h3>Lab Subjects</h3>
                              <table border="1">
                                  <thead>
                                      <tr>
                                          <th>Academic Year</th>
                                          <th>B. Tech. Year</th>
                                          <th>Sem</th>
                                          <th>Section</th>
                                          <th>Name of the subject</th>
                                          <th>No of Students Appeared</th>
                                          <th>No of Students Passed</th>
                                          <th>% of Pass</th>
                                      </tr>
                                  </thead>
                                  <tbody>`;

                    labSubjects.forEach(teacher => {
                        table += `<tr>
                                    <td>${teacher['Academic Year']}</td>
                                    <td>${teacher['B. Tech. Year']}</td>
                                    <td>${teacher['Sem']}</td>
                                    <td>${teacher['Section']}</td>
                                    <td>${teacher['Name of the subject']}</td>
                                    <td>${teacher['No of Students Appeared']}</td>
                                    <td>${teacher['No of Students passed']}</td>
                                    <td>${(parseFloat(teacher['% of Pass']) || 0).toFixed(2)}</td> 
                                  </tr>`;
                    });

                    table += `</tbody></table>`;
                }

                table += `<div class="signature">
                              <p>Signature of COE: </p>
                              <p>Signature of Director: </p>
                          </div>`;

                resultDiv.innerHTML = table;

                // Remove any existing event listener for the print button
                const printButton = document.getElementById('printButton');
                const newPrintButton = printButton.cloneNode(true); // Clone the print button to remove all existing listeners
                printButton.parentNode.replaceChild(newPrintButton, printButton); // Replace the old print button with the new one

                // Add PDF generation functionality
                newPrintButton.addEventListener('click', function() {
                    const form = document.getElementById('teacherForm');
                    newPrintButton.style.display = 'none';

                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    doc.setFont("Arial", "normal");

                    // Add the image header
                    const imgData = 'gni banner.jpeg'; // Replace with your actual base64 image string
                    doc.addImage(imgData, 'PNG', 10, 10, 190, 40); // Adjust as needed

                    // Optionally add the title under the image
                    doc.setTextColor(255, 0, 0); // Set text color to red
                    doc.setFontSize(30);
                    doc.text('Result Analysis', 72, 60);
                    // Adjust position accordingly
                    doc.setTextColor(0, 0, 0); // Reset to black for the rest of the document

                    // Add teacher details to PDF
                    doc.setFontSize(15);
                    doc.text(`Faculty Name: ${teacherName}`, 10, 70);
                    doc.text(`Department: ${dept}`, 10, 80);
                    doc.text(`Designation: ${designation}`, 10, 90);
                    doc.text(`Employee ID: ${empId}`, 10, 100);

                    let startY = 110;

                    // Function to add tables to the PDF
                    const addTableToPDF = (subjects, title) => {
                        if (subjects.length > 0) {
                            doc.setFontSize(14);
                            doc.text(title, 10, startY);
                            startY += 10;

                            const headers = ["Academic Year", "B. Tech. Year", "Sem", "Section", "Name of the subject", "No of Students Appeared", "No of Students Passed", "% of Pass"];
                            const data = subjects.map(teacher => [
                                teacher['Academic Year'],
                                teacher['B. Tech. Year'],
                                teacher['Sem'],
                                teacher['Section'],
                                teacher['Name of the subject'],
                                teacher['No of Students Appeared'],
                                teacher['No of Students passed'],
                                (parseFloat(teacher['% of Pass']) || 0).toFixed(2)
                            ]);

                            doc.autoTable({
                                head: [headers],
                                body: data,
                                startY: startY,
                                theme: 'grid',
                                styles: {
                                    fontSize: 10,
                                    textColor: [0, 0, 0], // Black text color
                                    lineColor: [0, 0, 0], // Black line color
                                    fillColor: [255, 255, 255], // White background for body
                                    lineWidth: 0.5 // Border width
                                },
                                headStyles: {
                                    fillColor: [255, 255, 255], // White background for header
                                    textColor: [0, 0, 0], // Black text for header
                                    fontStyle: 'bold', // Bold header text
                                    lineWidth: 0.5, // Border width for header
                                    lineColor: [0, 0, 0] // Black border for header
                                },
                                bodyStyles: {
                                    fillColor: [255, 255, 255] // White background for body
                                },
                                didParseCell: function(data) {
                                    if (data.row.index === 0) { // If it’s a header
                                        data.cell.styles.lineWidth = 0.5; // Header border width
                                        data.cell.styles.lineColor = [0, 0, 0]; // Header border color
                                    } else {
                                        data.cell.styles.lineWidth = 0.5; // Body border width
                                        data.cell.styles.lineColor = [0, 0, 0]; // Body border color
                                    }
                                },
                                margin: { autoTable: startY },
                                pageBreak: 'auto', // Automatically break the table into pages
                                didDrawPage: function(data) {

                                    startY = data.cursor.y + 10; // Update startY to position after the table.
                                }
                            });

                            startY = doc.autoTable.previous.finalY + 10; // Update startY for the next table
                        }
                    };

                    // Add the lecture and lab tables to PDF
                    addTableToPDF(lectureSubjects, "Theory Subjects");
                    // addTableToPDF(labSubjects, "Lab Subjects"); ****

                    // Add signature placeholders
                    const finalY = doc.autoTable.previous.finalY + 20;
                    const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width

                    // Signature of COE on the left
                    doc.text('Signature of COE: ', 10, finalY);

                    // Signature of Director on the right (adjusting the value so it's aligned with the right edge)
                    doc.text('Signature of Director: ', pageWidth - 60, finalY); // Adjust '60' based on your spacing needs

                    // Save the PDF
                    const facultyName = teacherName.replace(/\s+/g, '_'); // Replace spaces with underscores for the filename

                    // Save the PDF with the faculty name in the filename
                    doc.save(`${facultyName}_Report.pdf`);

                    // Restore the print button visibility
                    newPrintButton.style.display = 'block';
                });
            } else {
                resultDiv.innerHTML = `<h2>No details found for the entered EMP Code.</h2>`;
            }
        });
    })
    .catch(error => console.error('Error loading teacher data:', error));