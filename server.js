const express = require("express");
const path = require("path");
const si = require("systeminformation");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;

app.get("/api/systeminfo", async (req, res) => {
    try {
        const data = await si.get({
            cpu: "manufacturer, brand, speed, cores, physicalCores, efficiencyCores",
            osInfo: "platform, release, arch",
            system: "model, manufacturer",
            mem: "*",
            memLayout: "*"
        });

        if (data.mem) {
            data.mem = {
                total: data.mem.total,
                free: data.mem.free,
                used: data.mem.used,
            };
        } else {
            console.warn("Memory data is missing from systeminformation.");
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));