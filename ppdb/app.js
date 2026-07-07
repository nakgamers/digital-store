const API_URL =
"https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnSlbb9ZWSjGSEGUdZ0tqKlLGkiHWsKocc85XM8oqndnYClCaeH2DNMCFfi3KB3picbb8sCHbdC6-y7R9cUCNxPs9QGweI1vYO7Qxd4KtLYWxWIAep2XdL24KMKaHCz9dX8DzOQrbOCxowboFxGOVxRzqU04hBmu6TprZkYjndwaVq0Cox5rfy2SOeGBiVqN8_LfYAMA9SS4KIlKNU76n2O5vEKHNkuIOLv5ySg18o7lauxhK82JequdxC4Be_VKPEbYrgZeKdhaKrgaUZnjUfXmE9q31A&lib=MzawmfAFAGJ-OAYbEYXyUKL6E_lHEQFLY";

const FORMULIR_KELUAR_URL =
"https://docs.google.com/spreadsheets/d/1-2J2cSSsk3Z4kcO3Bi8jCNTJ_fKeVFV9gJOfs6ZJTjM/gviz/tq?gid=1871636261";

const FORMULIR_KELUAR_CALLBACK = "handleFormulirKeluarResponse";

let genderChart = null;

// Konfigurasi kuota per jurusan
// Target: 4 kelas per jurusan (2 pagi + 2 siang), 36 siswa per kelas
const KUOTA_PER_KELAS = 36;
const KELAS_PAGI = 2;
const KELAS_SIANG = 2;
const KUOTA_PAGI = KUOTA_PER_KELAS * KELAS_PAGI;   // 72
const KUOTA_SIANG = KUOTA_PER_KELAS * KELAS_SIANG; // 72
const KUOTA_TOTAL = KUOTA_PAGI + KUOTA_SIANG;      // 144

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

function normalizeShift(value) {

    const normalized =
        String(value ?? "").trim().toLowerCase();

    if (normalized.includes("pagi")) {
        return "pagi";
    }

    if (normalized.includes("siang")) {
        return "siang";
    }

    return null;

}

function renderJurusanCard(container, nama, stats) {

    const meta =
        getJurusanMeta(nama);

    const card =
        document.createElement("div");
    card.className = "jurusan-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Lihat detail kuota jurusan ${nama}`);

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

    const kuotaHint =
        document.createElement("div");
    kuotaHint.className = "jurusan-kuota-hint";
    kuotaHint.textContent = `Kuota ${stats.total}/${KUOTA_TOTAL}`;

    const totalElement =
        document.createElement("div");
    totalElement.className = "jurusan-total";
    totalElement.style.color = meta.color;
    totalElement.textContent = stats.total;

    textWrapper.appendChild(title);
    textWrapper.appendChild(kuotaHint);
    left.appendChild(icon);
    left.appendChild(textWrapper);

    card.appendChild(left);
    card.appendChild(totalElement);

    const openDetail = () => openJurusanModal(nama, stats, meta);

    card.addEventListener("click", openDetail);

    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetail();
        }
    });

    container.appendChild(card);

}

function buildKuotaRow(label, jumlah, kuota) {

    const sisa =
        kuota - jumlah;

    const row =
        document.createElement("div");
    row.className = "kuota-row";

    const rowHead =
        document.createElement("div");
    rowHead.className = "kuota-row-head";

    const rowLabel =
        document.createElement("span");
    rowLabel.className = "kuota-row-label";
    rowLabel.textContent = label;

    const rowNumbers =
        document.createElement("span");
    rowNumbers.className = "kuota-row-numbers";
    rowNumbers.textContent = `${jumlah} / ${kuota}`;

    rowHead.appendChild(rowLabel);
    rowHead.appendChild(rowNumbers);

    const progressTrack =
        document.createElement("div");
    progressTrack.className = "kuota-progress-track";

    const progressFill =
        document.createElement("div");
    progressFill.className = "kuota-progress-fill";

    const percentage =
        kuota > 0 ? Math.min(100, Math.max(0, (jumlah / kuota) * 100)) : 0;

    progressFill.style.width = `${percentage}%`;

    if (jumlah > kuota) {
        progressFill.classList.add("kuota-progress-over");
    }

    progressTrack.appendChild(progressFill);

    const sisaLabel =
        document.createElement("div");
    sisaLabel.className = "kuota-sisa";

    if (sisa > 0) {
        sisaLabel.textContent = `Sisa kuota: ${sisa}`;
    } else if (sisa === 0) {
        sisaLabel.textContent = "Kuota penuh";
        sisaLabel.classList.add("kuota-sisa-penuh");
    } else {
        sisaLabel.textContent = `Melebihi kuota: ${Math.abs(sisa)}`;
        sisaLabel.classList.add("kuota-sisa-lebih");
    }

    row.appendChild(rowHead);
    row.appendChild(progressTrack);
    row.appendChild(sisaLabel);

    return row;

}

function openJurusanModal(nama, stats, meta) {

    const modal =
        document.getElementById("jurusanModal");
    const modalIcon =
        document.getElementById("jurusanModalIcon");
    const modalTitle =
        document.getElementById("jurusanModalTitle");
    const modalBody =
        document.getElementById("jurusanModalBody");

    modalIcon.textContent = meta.icon;
    modalIcon.style.color = meta.color;
    modalTitle.textContent = nama;

    modalBody.innerHTML = "";

    modalBody.appendChild(
        buildKuotaRow("Total Keseluruhan", stats.total, KUOTA_TOTAL)
    );
    modalBody.appendChild(
        buildKuotaRow("Kelas Pagi", stats.pagi, KUOTA_PAGI)
    );
    modalBody.appendChild(
        buildKuotaRow("Kelas Siang", stats.siang, KUOTA_SIANG)
    );

    if (stats.tanpaShift > 0) {
        const note =
            document.createElement("div");
        note.className = "kuota-note";
        note.textContent =
            `${stats.tanpaShift} pendaftar belum memiliki data Shift (pagi/siang).`;
        modalBody.appendChild(note);
    }

    modal.hidden = false;
    document.body.classList.add("modal-open");

}

function closeJurusanModal() {

    const modal =
        document.getElementById("jurusanModal");

    modal.hidden = true;
    document.body.classList.remove("modal-open");

}

function setupJurusanModal() {

    const modal =
        document.getElementById("jurusanModal");
    const overlay =
        document.getElementById("jurusanModalOverlay");
    const closeButton =
        document.getElementById("jurusanModalClose");

    closeButton.addEventListener("click", closeJurusanModal);
    overlay.addEventListener("click", closeJurusanModal);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) {
            closeJurusanModal();
        }
    });

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

function handleFormulirKeluarResponse(response) {

    const totalElement =
        document.getElementById("formulirKeluarTotal");
    const badgeElement =
        document.getElementById("formulirKeluarBadge");
    const statusElement =
        document.getElementById("formulirKeluarStatus");

    try {

        if (!response || response.status === "error") {
            throw new Error("Gagal mengambil data formulir keluar");
        }

        const total =
            extractFormulirKeluarTotal(response);

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

function loadFormulirKeluar() {

    const statusElement =
        document.getElementById("formulirKeluarStatus");

    const existingScript =
        document.getElementById("formulirKeluarScript");

    if (existingScript) {
        existingScript.remove();
    }

    const script =
        document.createElement("script");

    script.id = "formulirKeluarScript";
    script.src =
        `${FORMULIR_KELUAR_URL}&tqx=out:json;responseHandler:${FORMULIR_KELUAR_CALLBACK}`;

    script.onerror = () => {
        statusElement.innerText =
            "Data formulir keluar belum bisa dimuat";
    };

    document.body.appendChild(script);

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

            if (!jurusan[jur]) {
                jurusan[jur] = {
                    total: 0,
                    pagi: 0,
                    siang: 0,
                    tanpaShift: 0
                };
            }

            jurusan[jur].total++;

            const shift =
                normalizeShift(item["Shift"]);

            if (shift === "pagi") {
                jurusan[jur].pagi++;
            } else if (shift === "siang") {
                jurusan[jur].siang++;
            } else {
                jurusan[jur].tanpaShift++;
            }

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
            .filter(([, stats]) => stats.total > 0)
            .sort((a, b) => b[1].total - a[1].total)
            .forEach(([nama, stats]) => {
                renderJurusanCard(
                    jurusanCards,
                    nama,
                    stats
                );
            });

    } catch (error) {

        console.error(error);

    }

}

loadDashboard();
setupFormulirKeluarWidget();
setupJurusanModal();
loadFormulirKeluar();

setInterval(loadDashboard,30000);
setInterval(loadFormulirKeluar,30000);
