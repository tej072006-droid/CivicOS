// ==========================================
// CivicOS - Complete Connected System
// Citizen + Officer + Worker + Map
// ==========================================


// ==========================================
// 1. IMAGE UPLOAD + PREVIEW - REPORT PAGE
// ==========================================

const problemImage = document.getElementById("problemImage");

if (problemImage) {

    problemImage.addEventListener("change", function () {

        const file = this.files[0];

        const imageStatus =
            document.getElementById("imageStatus");

        const imagePreview =
            document.getElementById("imagePreview");

        if (file) {

            if (imageStatus) {
                imageStatus.textContent =
                    "Photo selected: " + file.name;
            }

            if (imagePreview) {
                imagePreview.src =
                    URL.createObjectURL(file);

                imagePreview.style.display =
                    "block";
            }

        }

    });

}


// ==========================================
// 2. LOCATION
// ==========================================

let selectedLatitude = null;
let selectedLongitude = null;


function getLocation() {

    const status =
        document.getElementById("locationStatus");

    if (!status) {
        return;
    }

    if (!navigator.geolocation) {

        status.textContent =
            "Location is not supported by this browser.";

        return;
    }

    status.textContent =
        "Getting your location...";


    navigator.geolocation.getCurrentPosition(

        function (position) {

            selectedLatitude =
                position.coords.latitude;

            selectedLongitude =
                position.coords.longitude;


            status.textContent =
                "Location selected: " +
                selectedLatitude.toFixed(5) +
                ", " +
                selectedLongitude.toFixed(5);

        },


        function () {

            status.textContent =
                "Unable to get location. Please allow location access.";

        }

    );

}


// ==========================================
// 3. SUBMIT REPORT
// ==========================================

function submitReport() {

    const imageElement =
        document.getElementById("problemImage");

    if (!imageElement) {
        return;
    }

    const image =
        imageElement.files[0];

    const descriptionElement =
        document.getElementById("description");

    const description =
        descriptionElement
            ? descriptionElement.value
            : "";


    if (!image) {

        alert(
            "Please upload a photo first."
        );

        return;
    }


    // Generate Issue ID
    const issueNumber =
        Math.floor(
            100 + Math.random() * 900
        );

    const issueId =
        "CIV-" + issueNumber;


    // Create report
    const report = {

        id: issueId,

        type: "Pending AI Detection",

        description: description,

        latitude: selectedLatitude,

        longitude: selectedLongitude,

        imageName: image.name,

        status: "Reported",

        assignedWorker: "Not Assigned",

        afterPhotoName: "",

        date:
            new Date().toLocaleString()

    };


    // Get existing reports
    let reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    reports.push(report);


    localStorage.setItem(
        "civicReports",
        JSON.stringify(reports)
    );


    // Show result
    const issueElement =
        document.getElementById("issueId");

    const resultElement =
        document.getElementById("result");


    if (issueElement) {
        issueElement.textContent =
            issueId;
    }


    if (resultElement) {
        resultElement.style.display =
            "block";
    }


    console.log(
        "CivicOS Report Saved:",
        report
    );

}


// ==========================================
// 4. TRACK REPORT
// ==========================================

function trackReport() {

    const input =
        document.getElementById("searchIssueId");


    if (!input) {
        return;
    }


    const searchId =
        input.value.trim().toUpperCase();


    if (!searchId) {

        alert(
            "Please enter your Issue ID."
        );

        return;
    }


    const reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    const report =
        reports.find(
            item =>
                item.id.toUpperCase() === searchId
        );


    const result =
        document.getElementById("trackResult");

    const notFound =
        document.getElementById("notFound");


    if (!report) {

        if (result) {
            result.style.display =
                "none";
        }

        if (notFound) {
            notFound.style.display =
                "block";
        }

        return;
    }


    if (notFound) {
        notFound.style.display =
            "none";
    }


    if (result) {
        result.style.display =
            "block";
    }


    const trackId =
        document.getElementById("trackId");

    const trackType =
        document.getElementById("trackType");

    const trackDescription =
        document.getElementById("trackDescription");

    const trackLocation =
        document.getElementById("trackLocation");

    const trackStatus =
        document.getElementById("trackStatus");

    const trackWorker =
        document.getElementById("trackWorker");

    const trackDate =
        document.getElementById("trackDate");


    if (trackId) {
        trackId.textContent =
            report.id;
    }


    if (trackType) {
        trackType.textContent =
            report.type;
    }


    if (trackDescription) {
        trackDescription.textContent =
            report.description || "No description";
    }


    let locationText =
        "Not selected";


    if (
        report.latitude !== null &&
        report.latitude !== undefined &&
        report.longitude !== null &&
        report.longitude !== undefined
    ) {

        locationText =
            Number(report.latitude).toFixed(5) +
            ", " +
            Number(report.longitude).toFixed(5);

    }


    if (trackLocation) {
        trackLocation.textContent =
            locationText;
    }


    if (trackStatus) {
        trackStatus.textContent =
            report.status;
    }


    if (trackWorker) {
        trackWorker.textContent =
            report.assignedWorker;
    }


    if (trackDate) {
        trackDate.textContent =
            report.date;
    }

}


// ==========================================
// 5. CREATE MAP FOR REPORT
// ==========================================

function createReportMap(report, mapId) {

    // Check Leaflet
    if (typeof L === "undefined") {

        console.warn(
            "Leaflet library not loaded."
        );

        return;
    }


    // Check coordinates
    if (
        report.latitude === null ||
        report.latitude === undefined ||
        report.longitude === null ||
        report.longitude === undefined
    ) {

        return;
    }


    const mapElement =
        document.getElementById(mapId);


    if (!mapElement) {
        return;
    }


    const latitude =
        Number(report.latitude);

    const longitude =
        Number(report.longitude);


    // Create map
    const map =
        L.map(mapId).setView(
            [latitude, longitude],
            16
        );


    // OpenStreetMap tiles
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,

            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ).addTo(map);


    // Marker
    const marker =
        L.marker(
            [latitude, longitude]
        ).addTo(map);


    // Popup
    marker.bindPopup(

        "<strong>CivicOS Report</strong><br>" +

        "Issue ID: " +
        report.id +
        "<br>" +

        "Status: " +
        report.status +
        "<br>" +

        "Location: " +
        latitude.toFixed(5) +
        ", " +
        longitude.toFixed(5)

    ).openPopup();

}


// ==========================================
// 6. OFFICER DASHBOARD
// ==========================================

function loadOfficerDashboard() {

    const reportsContainer =
        document.getElementById("reportsContainer");


    if (!reportsContainer) {
        return;
    }


    const reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    // Statistics
    const total =
        reports.length;


    const reported =
        reports.filter(
            report =>
                report.status === "Reported"
        ).length;


    const assigned =
        reports.filter(
            report =>
                report.status === "Assigned" ||
                report.status === "In Progress"
        ).length;


    const completed =
        reports.filter(
            report =>
                report.status === "Completed"
        ).length;


    const totalReports =
        document.getElementById("totalReports");

    const reportedCount =
        document.getElementById("reportedCount");

    const assignedCount =
        document.getElementById("assignedCount");

    const resolvedCount =
        document.getElementById("resolvedCount");


    if (totalReports) {
        totalReports.textContent =
            total;
    }


    if (reportedCount) {
        reportedCount.textContent =
            reported;
    }


    if (assignedCount) {
        assignedCount.textContent =
            assigned;
    }


    if (resolvedCount) {
        resolvedCount.textContent =
            completed;
    }


    // No reports
    if (reports.length === 0) {

        reportsContainer.innerHTML =
            "<p>No reports available.</p>";

        return;
    }


    reportsContainer.innerHTML = "";


    reports.forEach(function (report) {

        const card =
            document.createElement("div");


        card.className =
            "problem-card";


        card.style.marginBottom =
            "20px";


        // Unique map ID
        const mapId =
            "map-" +
            report.id;


        let locationHTML = "";


        if (
            report.latitude !== null &&
            report.latitude !== undefined &&
            report.longitude !== null &&
            report.longitude !== undefined
        ) {

            locationHTML = `

                <p>
                    <strong>Location:</strong>
                    ${Number(report.latitude).toFixed(5)},
                    ${Number(report.longitude).toFixed(5)}
                </p>

                <div
                    id="${mapId}"
                    class="map-container"
                ></div>

            `;

        } else {

            locationHTML = `

                <p>
                    <strong>Location:</strong>
                    Not selected
                </p>

                <div class="map-container">

                    <p style="
                        text-align:center;
                        padding-top:140px;
                        color:#667085;
                    ">
                        📍 Location not available
                    </p>

                </div>

            `;

        }


        card.innerHTML = `

            <h3>
                ${report.id}
            </h3>


            <p>
                <strong>Problem:</strong>
                ${report.type}
            </p>


            <p>
                <strong>Description:</strong>
                ${report.description || "No description"}
            </p>


            ${locationHTML}


            <p>
                <strong>Photo:</strong>
                ${report.imageName}
            </p>


            <p>
                <strong>Status:</strong>
                ${report.status}
            </p>


            <p>
                <strong>Worker:</strong>
                ${report.assignedWorker}
            </p>


            ${
                report.afterPhotoName
                ?
                `
                <p>
                    <strong>After Photo:</strong>
                    ${report.afterPhotoName}
                </p>
                `
                :
                ""
            }


            <p>
                <strong>Reported:</strong>
                ${report.date}
            </p>


            <button
                onclick="assignWorker('${report.id}')"
            >
                👷 Assign Worker
            </button>

        `;


        reportsContainer.appendChild(card);


        // Create map AFTER card is added
        if (
            report.latitude !== null &&
            report.latitude !== undefined &&
            report.longitude !== null &&
            report.longitude !== undefined
        ) {

            setTimeout(function () {

                createReportMap(
                    report,
                    mapId
                );

            }, 50);

        }

    });

}


// ==========================================
// 7. ASSIGN WORKER
// ==========================================

function assignWorker(issueId) {

    const workerName =
        prompt(
            "Enter worker name:"
        );


    if (!workerName) {
        return;
    }


    let reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    const report =
        reports.find(
            item =>
                item.id === issueId
        );


    if (report) {

        report.assignedWorker =
            workerName.trim();


        report.status =
            "Assigned";


        localStorage.setItem(
            "civicReports",
            JSON.stringify(reports)
        );


        alert(
            issueId +
            " assigned to " +
            workerName
        );


        loadOfficerDashboard();

    }

}


// ==========================================
// 8. WORKER DASHBOARD
// ==========================================

function loadWorkerDashboard() {

    const workerReportsContainer =
        document.getElementById("workerReports");


    if (!workerReportsContainer) {
        return;
    }


    // Ask worker name
    let workerName =
        prompt(
            "Enter your worker name:"
        );


    if (!workerName) {

        workerReportsContainer.innerHTML =
            "<p>Please enter your worker name to view assigned work.</p>";

        return;
    }


    workerName =
        workerName.trim();


    // Get reports
    const reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    // Find assigned reports
    const assignedReports =
        reports.filter(
            report =>
                report.assignedWorker &&
                report.assignedWorker.toLowerCase() ===
                workerName.toLowerCase()
        );


    // No assigned work
    if (assignedReports.length === 0) {

        workerReportsContainer.innerHTML = `

            <div class="problem-card">

                <h3>
                    No Assigned Work
                </h3>

                <p>
                    No civic problem is currently assigned
                    to ${workerName}.
                </p>

            </div>

        `;

        return;
    }


    // Clear container
    workerReportsContainer.innerHTML = "";


    // Display assigned work
    assignedReports.forEach(function (report) {

        const card =
            document.createElement("div");


        card.className =
            "problem-card";


        card.style.marginBottom =
            "20px";


        card.innerHTML = `

            <h3>
                ${report.id}
            </h3>


            <p>
                <strong>Problem:</strong>
                ${report.type}
            </p>


            <p>
                <strong>Description:</strong>
                ${report.description || "No description"}
            </p>


            <p>
                <strong>Location:</strong>
                ${
                    report.latitude !== null &&
                    report.latitude !== undefined
                    ?
                    Number(report.latitude).toFixed(5) +
                    ", " +
                    Number(report.longitude).toFixed(5)
                    :
                    "Not selected"
                }
            </p>


            <p>
                <strong>Status:</strong>
                ${report.status}
            </p>


            <p>
                <strong>Assigned Worker:</strong>
                ${report.assignedWorker}
            </p>


            <hr>


            ${
                report.status === "Assigned"
                ?
                `
                <button
                    onclick="startWork('${report.id}')"
                >
                    ▶ Start Work
                </button>
                `
                :
                ""
            }


            ${
                report.status === "In Progress"
                ?
                `

                <h4>
                    Upload After-Work Photo
                </h4>


                <input
                    type="file"
                    id="afterPhoto-${report.id}"
                    accept="image/*"
                >


                <br><br>


                <button
                    onclick="completeWork('${report.id}')"
                >
                    ✓ Mark Work Completed
                </button>

                `
                :
                ""
            }


            ${
                report.status === "Completed"
                ?
                `
                <p>
                    <strong>
                        ✓ Work Completed
                    </strong>
                </p>


                <p>
                    After Photo:
                    ${report.afterPhotoName || "Uploaded"}
                </p>
                `
                :
                ""
            }

        `;


        workerReportsContainer.appendChild(card);

    });

}


// ==========================================
// 9. START WORK
// ==========================================

function startWork(issueId) {

    let reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    const report =
        reports.find(
            item =>
                item.id === issueId
        );


    if (!report) {
        return;
    }


    report.status =
        "In Progress";


    localStorage.setItem(
        "civicReports",
        JSON.stringify(reports)
    );


    alert(
        issueId +
        " is now In Progress."
    );


    loadWorkerDashboard();

}


// ==========================================
// 10. COMPLETE WORK
// ==========================================

function completeWork(issueId) {

    const photoInput =
        document.getElementById(
            "afterPhoto-" + issueId
        );


    if (
        !photoInput ||
        !photoInput.files[0]
    ) {

        alert(
            "Please upload an after-work photo first."
        );

        return;
    }


    const afterPhoto =
        photoInput.files[0];


    let reports =
        JSON.parse(
            localStorage.getItem("civicReports")
        ) || [];


    const report =
        reports.find(
            item =>
                item.id === issueId
        );


    if (!report) {
        return;
    }


    // Save photo filename
    report.afterPhotoName =
        afterPhoto.name;


    // Change status
    report.status =
        "Completed";


    localStorage.setItem(
        "civicReports",
        JSON.stringify(reports)
    );


    alert(
        issueId +
        " work has been completed successfully."
    );


    loadWorkerDashboard();

}


// ==========================================
// 11. AUTO LOAD OFFICER
// ==========================================

if (
    document.getElementById("reportsContainer")
) {

    loadOfficerDashboard();

}


// ==========================================
// 12. AUTO LOAD WORKER
// ==========================================

if (
    document.getElementById("workerReports")
) {

    loadWorkerDashboard();

}