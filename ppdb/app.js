const API_URL =
"https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSlbb9ZWSjGSEGUdZ0tqKlLGkiHWsKocc85XM8oqndnYClCaeH2DNMCFfi3KB3picbb8sCHbdC6-y7R9cUCNxPs9QGweI1vYO7Qxd4KtLYWxWIAep2XdL24KMKaHCz9dX8DzOQrbOCxowboFxGOVxRzqU04hBmu6TprZkYjndwaVq0Cox5rfy2SOeGBiVqN8_LfYAMA9SS4KIlKNU76n2O5vEKHNkuIOLv5ySg18o7lauxhK82JequdxC4Be_VKPEbYrgZeKdhaKrgaUZnjUfXmE9q31A&lib=MzawmfAFAGJ-OAYbEYXyUKL6E_lHEQFLY";

let genderChart = null;

async function loadDashboard() {

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        const total = data.length;

        let laki = 0;
        let perempuan = 0;

        const jurusan = {};

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

        // PIE CHART GENDER

        if (genderChart) {
            genderChart.destroy();
        }

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
                        ],
                        backgroundColor: [
                            "#2563eb",
                            "#ec4899"
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

        // CARD JURUSAN

        const jurusanCards =
            document.getElementById("jurusanCards");

        jurusanCards.innerHTML = "";

        Object.entries(jurusan)
.filter(([nama,total]) => total > 0)
.sort((a,b) => b[1] - a[1])
.forEach(([nama,total]) =>  {

            let icon = "🎓";
            let warna = "#64748b";

            if (
                nama.toLowerCase().includes("komputer")
            ) {
                icon = "💻";
                warna = "#2563eb";
            }

            else if (
                nama.toLowerCase().includes("kantor")
            ) {
                icon = "🏢";
                warna = "#16a34a";
            }

            else if (
                nama.toLowerCase().includes("akunt")
            ) {
                icon = "📊";
                warna = "#f59e0b";
            }

            jurusanCards.innerHTML += `
            <div class="jurusan-card">

                <div class="jurusan-left">

                    <div class="jurusan-icon">
                        ${icon}
                    </div>

                    <div>

                        <div class="jurusan-title">
                            ${nama}
                        </div>

                    </div>

                </div>

                <div class="jurusan-total"
                     style="color:${warna}">
                    ${total}
                </div>

            </div>
            `;

        });

    } catch (error) {

        console.error(error);

    }

}

loadDashboard();

setInterval(loadDashboard,30000);