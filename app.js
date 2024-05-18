const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const fs = require("fs");
const crypto = require("crypto");
const os = require("os");

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

function ge() {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		for (const net of interfaces[name]) {
			if (net.family === "IPv4" && !net.internal) {
				return net.address;
			}
		}
	}
	return "localhost";
}

console.log(ge());

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "data/");
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const filename =
			file.originalname.slice(0, file.originalname.lastIndexOf(".")) +
			"_" +
			Date.now() +
			"_" +
			// generate hash of the file name and take first 6 characters
			crypto
				.createHash("sha256")
				.update(file.originalname)
				.digest("hex")
				.slice(0, 6) +
			ext;
		cb(null, filename);
	},
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
	res.render("index", { serverIp: ge() });
});

// Handle file uploads
app.post("/upload", (req, res) => {
	const singleUpload = upload.single("file");

	singleUpload(req, res, (err) => {
		if (err) {
			console.error(err);
			return res.status(500).send("File upload error.");
		}

		console.log("File uploaded:", req.file.filename);

		// fileID is the string after the second last underscore in the file name
		// e.g. fileID of "file_123456_abcdefg.jpg" is 123456_abcdefg
		// extract file ID from the file name

		const fileID = req.file.filename
			.split("_")
			.slice(-2)
			.join("_") // remove the extension
			.split(".")[0];

		res.json({ file_id: fileID, status: 1 });
	});
});

// Serve the file details page
app.get("/:fileID", (req, res) => {
	const fileID = req.params.fileID;
	console.log("File ID for retrieval:", fileID);

	fs.readdir("data", (err, files) => {
		if (err) {
			console.error(err);
			return res.status(500).send("Server error.");
		}

		const file = files.find((f) => {
			// console.log(f, fileID, f.slice(0, f.lastIndexOf(".")).endsWith(fileID));
			if (f.slice(0, f.lastIndexOf(".")).endsWith(fileID)) return f;
		});

		if (file) {
			res.render("file_page", {
				fileID: fileID,
				fileType: file.slice(file.lastIndexOf(".") + 1),
				fileName: file,
				status: 1,
			});
		} else {
			res.render("file_page", {
				fileName: null,
				fileType: file.slice(file.lastIndexOf(".") + 1),
				fileID: fileID,
				status: 0,
			});
		}
	});
});

// Fetch file details
app.get("/download/:fileID", (req, res) => {
	const fileID = req.params.fileID;
	// Check if the file ending exactly with fileID exists
	fs.readdir("data", (err, files) => {
		if (err) {
			console.error(err);
			return res.status(500).send("Server error.");
		}

		const file = files.find((f) => {
			if (f.slice(0, f.lastIndexOf(".")).endsWith(fileID)) return f;
		});

		// console.log(files, file);

		// download the file
		if (file) {
			res.download(`data/${file}`);
		} else {
			res.status(404).send("File not found.");
		}
	});
});

const PORT = process.env.PORT || 8000;

// Start the server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on http://${ge()}:${PORT}`);
});
