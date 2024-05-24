const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const SERVER_IP = process.env.SERVER_IP || "127.0.0.1";
const PORT = process.env.PORT || 8000; // Default port; can be changed using environment variable

const app = express();

app.set("view engine", "ejs"); // Set the view engine to EJS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the public directory

if (!fs.existsSync("data")) {
	fs.mkdirSync("data");
}

// Map to store file metadata and upload status
const files = new Map(); // Can be replaced with a database in future

console.log("The server IP is:", SERVER_IP);

// Configure multer storage
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "data/");
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const filename =
			file.originalname.slice(0, file.originalname.lastIndexOf(".")) +
			"_" +
			req.body.file_id +
			ext;
		cb(null, filename);
	},
});

const upload = multer({ storage: storage }).single("file"); // Single file upload

app.get("/", (req, res) => {
	res.render("index", { serverIP: SERVER_IP });
});

// Handle file uploads
app.post("/upload", (req, res) => {
	upload(req, res, (err) => {
		if (err) {
			console.error(err);
			return res.status(500).send("File upload error.");
		}
		console.log("File uploaded:", req.file.filename);
		console.log("File ID:", req.body.file_id);
		const fileID = req.body.file_id;
		files.set(fileID, { status: "uploaded" });
		res.json({
			file_id: fileID,
			link: `http://${SERVER_IP}:${PORT}/${fileID}`,
		});
	});
});

// Serve the file details page
app.get("/:fileID", (req, res) => {
	const fileID = req.params.fileID;
	const fileData = files.get(fileID);
	// console.log(fileData);

	// Wait for upload process to finish
	if (fileData && fileData.status === "uploaded") {
		fs.readdir("data", (err, files) => {
			if (err) {
				console.error(err);
				return res.status(500).send("Server error.");
			}

			const file = files.find((f) => {
				if (f.slice(0, f.lastIndexOf(".")).endsWith(fileID)) return f;
			});

			if (file) {
				res.render("file_page", {
					fileID: fileID,
					fileName: file,
					fileType: file.slice(file.lastIndexOf(".") + 1),
					status: 1,
				});
			} else {
				res.render("file_page", {
					fileName: null,
					fileID: fileID,
					status: 0,
				});
			}
		});
	} else {
		console.log("File not uploaded yet.");
		res.render("file_page", {
			fileName: null,
			fileID: fileID,
			status: 0,
		});
	}
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
			// console.log(f, fileID, f.slice(0, f.lastIndexOf(".")).endsWith(fileID));
			if (f.slice(0, f.lastIndexOf(".")).endsWith(fileID)) return f;
		});

		// download the file
		if (file) {
			res.download(`data/${file}`);
		} else {
			res.status(404).send("File not found.");
		}
	});
});

// Start the server
// Listen on all network interfaces
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on http://${SERVER_IP}:${PORT}`);
});
