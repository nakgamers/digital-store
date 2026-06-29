const API_URL =
"https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSlbb9ZWSjGSEGUdZ0tqKlLGkiHWsKocc85XM8oqndnYClCaeH2DNMCFfi3KB3picbb8sCHbdC6-y7R9cUCNxPs9QGweI1vYO7Qxd4KtLYWxWIAep2XdL24KMKaHCz9dX8DzOQrbOCxowboFxGOVxRzqU04hBmu6TprZkYjndwaVq0Cox5rfy2SOeGBiVqN8_LfYAMA9SS4KIlKNU76n2O5vEKHNkuIOLv5ySg18o7lauxhK82JequdxC4Be_VKPEbYrgZeKdhaKrgaUZnjUfXmE9q31A&lib=MzawmfAFAGJ-OAYbEYXyUKL6E_lHEQFLY";

const FORMULIR_KELUAR_URL =
"https://docs.google.com/spreadsheets/d/1-2J2cSSsk3Z4kcO3Bi8jCNTJ_fKeVFV9gJOfs6ZJTjM/gviz/tq?tqx=out:json&gid=1871636261";

let genderChart = null;

function getJurusanMeta(nama) {

    const normalizedName =
        nama.toLowerCase();

    if (normalizedName.includes("komputer")) {
        return {
            icon: "\uD83D\uDCBB",
            color: "#2563eb"
        };
    }

    if (normalizedName.includes("kantor")) {
        return {
            icon: "\uD83C\uDFE2",
            color: "#16a34a"
        };
    }

    if (normalizedName.includes("akunt")) {
        return {
            icon: "\uD83D\uDCCA",
            color: "#f59e0b"
        };
    }

    return {
        icon: "\uD83C\uDF93",
        color: "#64748b"
    };

}

function renderJurusanCard(container, nama, total) {

    const meta =
        getJurusanMeta(nama);

    const card =
        document.createElement("div");
    card.className = "jurusan-card";

    const left =
        document.createElement("div");
    left.className = "jurusan-left";

    const icon =
        document.createElement("div");
    icon.className = "jurusan-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = meta.icon;

    const textWrapper =
        document.createElement("div");

    const title =
        document.createElement("div");
    title.className = "jurusan-title";
    title.textContent = nama;

    const totalElement =
        document.createElement("div");
    totalElement.className = "jurusan-total";
    totalElement.style.color = meta.color;
    totalElement.textContent = total;

    textWrapper.appendChild(title);
    left.appendChild(icon);
    left.appendChild(textWrapper);

    card.appendChild(left);
    card.appendChild(totalElement);

    container.appendChild(card);

}

function parseGoogleSheetResponse(text) {

    const jsonText =
        text.trim()
            .replace(/^\/\*O_o\*\/\s*/, "")
            .replace(/^google\.visualization\.Query\.setResponse\(/, "")
            .replace(/\);$/, "");

    return JSON.parse(jsonText);

}

function getNumericValue(value) {

    const number =
        Number(String(value ?? "").replace(/[^\d.-]/g, ""));

    return Number.isFinite(number) ? number : null;

}

function extractFormulirKeluarTotal(data) {

    if (typeof data === "number") {
        return data;
    }

    if (Array.isArray(data)) {
        const firstRow =
            data[0] || {};

        return getNumericValue(
            firstRow["Formulir Keluar"] ??
            firstRow.formulirKeluar ??
            firstRow.total ??
            firstRow.jumlah ??
            data.length
        );
    }

    if (data?.table?.rows) {
        const cells =
            data.table.rows.flatMap(row => row.c || []);

        const numericCell =
            cells.find(cell => getNumericValue(cell?.v) !== null);

        return getNumericValue(numericCell?.v);
    }

    return getNumericValue(
        data?.["Formulir Keluar"] ??
        data?.formulirKeluar ??
        data?.total ??
        data?.jumlah
    );

}

async function loadFormulirKeluar() {

    const totalElement =
        document.getElementById("formulirKeluarTotal");
    const badgeElement =
        document.getElementById("formulirKeluarBadge");
    const statusElement =
        document.getElementById("formulirKeluarStatus");

    try {

        const response =
            await fetch(FORMULIR_KELUAR_URL);

        if (!response.ok) {
            throw new Error("Gagal mengambil data formulir keluar");
        }

        const text =
            await response.text();

        const data =
            text.trim().startsWith("google.visualization")
                || text.trim().startsWith("/*O_o*/")
                ? parseGoogleSheetResponse(text)
                : JSON.parse(text);

        const total =
            extractFormulirKeluarTotal(data);

        if (total === null) {
            throw new Error("Format data formulir keluar tidak valid");
        }

        totalElement.innerText =
            total;

        badgeElement.innerText =
            total;

        statusElement.innerText =
            "Data dari Sheet1 spreadsheet yang sama";

    } catch (error) {

        statusElement.innerText =
            "Data formulir keluar belum bisa dimuat";

        console.error(error);

    }

}

function setupFormulirKeluarWidget() {

    const panel =
        document.getElementById("formulirKeluarPanel");
    const toggle =
        document.getElementById("formulirKeluarToggle");
    const close =
        document.getElementById("formulirKeluarClose");

    function setOpen(isOpen) {
        panel.hidden = !isOpen;
        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? "Tutup formulir keluar" : "Buka formulir keluar"
        );
    }

    toggle.addEventListener("click", () => {
        setOpen(panel.hidden);
    });

    close.addEventListener("click", () => {
        setOpen(false);
    });

}

async function loadDashboard() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Gagal mengambil data PPDB");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Format data PPDB tidak valid");
        }

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
                String(item["Jurusan"] || "Lainnya").trim() || "Lainnya";

            jurusan[jur] =
                (jurusan[jur] || 0) + 1;

        });

        document.getElementById("total").innerText =
            total;

        document.getElementById("laki").innerText =
            laki;

        document.getElementById("perempuan").innerText =
            perempuan;

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

        const jurusanCards =
            document.getElementById("jurusanCards");

        jurusanCards.innerHTML = "";

        Object.entries(jurusan)
            .filter(([, totalJurusan]) => totalJurusan > 0)
            .sort((a, b) => b[1] - a[1])
            .forEach(([nama, totalJurusan]) => {
                renderJurusanCard(
                    jurusanCards,
                    nama,
                    totalJurusan
                );
            });

    } catch (error) {

        console.error(error);

    }

}

loadDashboard();
setupFormulirKeluarWidget();
loadFormulirKeluar();

setInterval(loadDashboard,30000);
setInterval(loadFormulirKeluar,30000);
