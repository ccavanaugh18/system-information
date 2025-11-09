document.addEventListener("DOMContentLoaded", async () => {
    const navButtons = document.querySelectorAll("#nav button");
    const sections = document.querySelectorAll(".info-section");
    const loadingEl = document.getElementById("loading");
    const infoSections = document.getElementById("info-sections");
    const scanContainer = document.getElementById("about");
    const nav = document.getElementById("nav");

    document.getElementById("start-scan").addEventListener("click", async() => {
        scanContainer.style.display = "none";
        loadingEl.textContent = "Loading System Information...";
        loadingEl.classList.remove("hidden");
        await new Promise(requestAnimationFrame);

        let data = {};
        try {
            const res = await fetch("/api/systeminfo");
            data = await res.json();
            populateAll(data);
            nav.classList.remove("hidden");
            infoSections.classList.remove("hidden");
            sections.forEach(s => s.classList.add("hidden"));
            document.getElementById("general-section").classList.remove("hidden");
            loadingEl.classList.add("hidden");
        } catch (err) {
            console.error("Failed to fetch system info:", err);
            loadingEl.textContent = "Failed to load system information."
        }
    });

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            navButtons.forEach(b => b.classList.remove("active"));
            button.classList.add("active");

            const section = button.dataset.section;
            sections.forEach(s => s.classList.add("hidden"));
            document.getElementById(`${section}-section`).classList.remove("hidden");
        });
    });

    const refreshButtons = document.querySelectorAll(".refresh-button");
    refreshButtons.forEach(button => {
        button.addEventListener("click", async () => {
            loadingEl.textContent = "Loading...";
            loadingEl.classList.remove("hidden");

            try {
                const res = await fetch("/api/systeminfo");
                const newData = await res.json();
                refreshSection(button.dataset.section, newData);
            } catch (err) {
                console.error(`Failed to refresh ${button.dataset.section}:`, err);
                loadingEl.textContent = `Failed to refresh ${button.dataset.section}.`;
                setTimeout(() => loadingEl.classList.add("hidden"), 2000);
                return;
            }

            loadingEl.classList.add("hidden");
        });
    });
});

function populateAll(data) {
    refreshSection("general", data);
    refreshSection("cpu", data);
    refreshSection("memory", data);
}

function refreshSection(section, data) {
    if (section === "general") {
        populateList("general-info", {
            Platform: data.osInfo.platform,
            "Release Version": data.osInfo.release,
            Model: data.system.model,
            Manufacturer: data.system.manufacturer
        });
    } else if (section === "cpu") {
        populateList("cpu-info", {
            Manufacturer: data.cpu.manufacturer,
            Model: data.cpu.brand,
            Speed: data.cpu.speed + "GHz",
            "Logical Cores(threads)": data.cpu.cores,
            "Physical Cores": data.cpu.physicalCores,
            "Efficiency Cores": data.cpu.efficiencyCores
        });
    } else if (section === "memory") {
        if (data.mem) {
            const memInfo = {
                "Total": (data.mem.total / 1e9).toFixed(2) + " GB",
                "Used": (data.mem.used / 1e9).toFixed(2) + " GB",
                "Free": (data.mem.free / 1e9).toFixed(2) + " GB",
            };

            if (data.memLayout && Array.isArray(data.memLayout) && data.memLayout.length > 0) {
                data.memLayout.forEach((stick, i) => {
                    const moduleNum = i + 1;
                    const manufacturer = stick.manufacturer || "Unknown";
                    const type = stick.type || "Unknown";
                    const speed = stick.clockSpeed ? stick.clockSpeed + " MHz" : "Unknown";
                    const size = (stick.size / 1e9).toFixed(2) + " GB";

                    memInfo[`Module ${moduleNum}`] = `${manufacturer} ${type} ${speed} ${size}`;
                });
            }
            populateList("memory-info", memInfo);
        } else {
            console.warn("Memory data is missing.");
        }
    }
}

function populateList(listId, infoObj) {
    const ul = document.getElementById(listId);
    ul.innerHTML = "";
    for (const [key, value] of Object.entries(infoObj)) {
        const li = document.createElement("li");
        li.textContent = `${key}: ${value}`;
        ul.appendChild(li);
    }
}
