// Get the add class button and class list elements
const addClassButton = document.getElementById('add-class');
const classList = document.getElementById('class-list');
const averageGradeSpan = document.getElementById('average-grade');

// Pagination controls
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageInfoSpan = document.getElementById('page-info');

const classesPerPage = 5;  // Number of classes to display per page
let currentPage = 1;  // Current page being displayed

// Initialize an empty array to store grades
let grades = loadGradesFromLocalStorage();

// Function to create and add class entries to the DOM
// Function to create and add class entries to the DOM
function createClassEntry(className = '', grade = '', addToStorage = true) {
    const classDiv = document.createElement('div');
    classDiv.className = 'class-div';

    const classNameInput = document.createElement('input');
    classNameInput.type = 'text';
    classNameInput.placeholder = 'Class Name';
    classNameInput.className = 'class-name-input';
    classNameInput.value = className;

    const gradeInput = document.createElement('input');
    gradeInput.type = 'number';
    gradeInput.placeholder = 'Grade';
    gradeInput.className = 'grade-input';
    gradeInput.value = grade;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';

    classDiv.appendChild(classNameInput);
    classDiv.appendChild(gradeInput);
    classDiv.appendChild(deleteButton);
    classList.appendChild(classDiv);

    // Add an event listener for grade input changes to update the grade
    if (addToStorage) {
        gradeInput.addEventListener('input', () => {
            const className = classNameInput.value.trim();
            const grade = parseFloat(gradeInput.value);

            if (className && !isNaN(grade)) {
                const index = grades.findIndex(g => g.className === className);
                if (index !== -1) {
                    grades[index].grade = grade;
                } else {
                    grades.push({ className, grade });
                }
                saveGradesToLocalStorage(grades);
                updateAverageGrade();
            }
        });
    }

    // Add an event listener for the delete button
    deleteButton.addEventListener('click', () => {
        // Remove the class div from the DOM
        classList.removeChild(classDiv);

        // Find and remove the class from the grades array
        const index = grades.findIndex(g => g.className === classNameInput.value);
        if (index !== -1) {
            grades.splice(index, 1);
        }

        // Update the local storage and re-render the current page
        saveGradesToLocalStorage(grades);
        updateAverageGrade();
        displayClassesForPage(currentPage);  // Refresh the current page
    });
}


// Add an event listener to the add class button
addClassButton.addEventListener('click', () => {
    const start = (currentPage - 1) * classesPerPage;
    const end = start + classesPerPage;

    // Check if the current page has available space
    if (grades.slice(start, end).length < classesPerPage) {
        createClassEntry();  // Add new class on current page
    } else {
        // If current page is full, move to the next page and add the class
        currentPage++;
        displayClassesForPage(currentPage);  // Display the next page
        createClassEntry();  // Add new class to the new page
    }
});

// Function to load grades from local storage
function loadGradesFromLocalStorage() {
    const gradesJson = localStorage.getItem('grades');
    return gradesJson ? JSON.parse(gradesJson) : [];
}

// Function to save grades to local storage
function saveGradesToLocalStorage(grades) {
    const gradesJson = JSON.stringify(grades);
    localStorage.setItem('grades', gradesJson);
}

// Function to update the average grade
function updateAverageGrade() {
    const validGrades = grades.filter(g => !isNaN(g.grade));
    if (validGrades.length > 0) {
        const sum = validGrades.reduce((acc, grade) => acc + grade.grade, 0);
        const average = sum / validGrades.length;
        averageGradeSpan.textContent = average.toFixed(2);
    } else {
        averageGradeSpan.textContent = '0.00';
    }
}

// Display the classes for the current page
function displayClassesForPage(page) {
    classList.innerHTML = '';

    const start = (page - 1) * classesPerPage;
    const end = start + classesPerPage;

    const classesForPage = grades.slice(start, end);
    classesForPage.forEach(grade => {
        if (grade.className && !isNaN(grade.grade)) {
            createClassEntry(grade.className, grade.grade, false);  // Don't add to storage when re-rendering
        }
    });

    pageInfoSpan.textContent = `Page ${page}`;
    prevPageButton.disabled = page === 1;
    nextPageButton.disabled = end >= grades.length;
}

// Pagination button listeners
nextPageButton.addEventListener('click', () => {
    if (currentPage * classesPerPage < grades.length) {
        currentPage++;
        displayClassesForPage(currentPage);
    }
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayClassesForPage(currentPage);
    }
});

// Load and display the first page of classes
displayClassesForPage(currentPage);
updateAverageGrade();
