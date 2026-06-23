const API_URL =
"https://script.google.com/macros/s/AKfycbxncYO7JzQki7eQBWzWY8bCFvYOTwOz1mtk9phb1SVIAy5JZjSE6f8QXqaq01y6ODDPVA/exec";

let genderChart = null;
let jurusanChart = null;

async function loadDashboard() {

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        const total = data.length;

        let laki = 0;
        let perempuan = 0;

        let jurusan = {};

        data.forEach(siswa => {

            // Gender
            const jk =
                siswa["Jenis Kelamin"] || "";

            if (
                jk.toLowerCase().includes("laki")
            ) {
                laki++;
            } else {
                perempuan++;
            }

            // Jurusan
            const jur =
                siswa["Jurusan"] || "Lainnya";

            jurusan[jur] =
                (jurusan[jur] || 0) + 1;

        });

        // Update Card

        document.getElementById("total").innerText =
            total;

        document.getElementById("laki").innerText =
            laki;

        document.getElementById("perempuan").innerText =
            perempuan;

        document.getElementById("targetPersen").innerText =
            ((total / 300) * 100).toFixed(1) + "%";

        // Destroy chart lama

        if (genderChart) {
            genderChart.destroy();
        }

        if (jurusanChart) {
            jurusanChart.destroy();
        }

        // Pie Gender

        genderChart = new Chart(
            document.getElementById("genderChart"),
            {
                type: "doughnut",
                data: {
                    labels: [
                        "Laki-Laki",
                        "Perempuan"
                    ],
                    datasets: [{
                        data: [
                            laki,
                            perempuan
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            }
        );

        // Jurusan

        jurusanChart = new Chart(
            document.getElementById("jurusanChart"),
            {
                type: "bar",
                data: {
                    labels:
                        Object.keys(jurusan),

                    datasets: [{
                        label: "Jumlah Siswa",
                        data:
                            Object.values(jurusan)
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            }
        );

        console.log(
            "Dashboard Updated",
            new Date()
        );

    } catch (error) {

        console.error(
            "Gagal mengambil data:",
            error
        );

    }
}

// Load pertama
loadDashboard();

// Auto Refresh 30 detik
setInterval(
    loadDashboard,
    30000
);