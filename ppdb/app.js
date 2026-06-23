const API_URL =
"https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSlbb9ZWSjGSEGUdZ0tqKlLGkiHWsKocc85XM8oqndnYClCaeH2DNMCFfi3KB3picbb8sCHbdC6-y7R9cUCNxPs9QGweI1vYO7Qxd4KtLYWxWIAep2XdL24KMKaHCz9dX8DzOQrbOCxowboFxGOVxRzqU04hBmu6TprZkYjndwaVq0Cox5rfy2SOeGBiVqN8_LfYAMA9SS4KIlKNU76n2O5vEKHNkuIOLv5ySg18o7lauxhK82JequdxC4Be_VKPEbYrgZeKdhaKrgaUZnjUfXmE9q31A&lib=MzawmfAFAGJ-OAYbEYXyUKL6E_lHEQFLY";

let genderChart = null;
let jurusanChart = null;

async function loadDashboard() {

    try {

        const res = await fetch(API_URL);
        const data = await res.json();

        console.log(data);

        const total = data.length;

        let laki = 0;
        let perempuan = 0;

        let jurusan = {};

        data.forEach(item => {

            const jk = String(
                item["Jenis Kelamin"] || ""
            ).trim().toLowerCase();

            if (jk.includes("laki")) {
                laki++;
            } else if (jk.includes("perempuan")) {
                perempuan++;
            }

            const jur =
                item["Jurusan"] || "Lainnya";

            jurusan[jur] =
                (jurusan[jur] || 0) + 1;

        });

        document.getElementById("total").innerText =
            total;

        document.getElementById("laki").innerText =
            laki;

        document.getElementById("perempuan").innerText =
            perempuan;

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
                }
            }
        );

    } catch(err) {

        console.error(err);

    }

}

loadDashboard();

// refresh otomatis 30 detik

setInterval(loadDashboard, 30000);