function handleFiles(files) {
  const preview = document.getElementById("image-preview");
  const metadataOutput = document.getElementById("metadata-output");
  preview.innerHTML = ""; // Clear previous previews
  metadataOutput.value = ""; // Clear previous metadata

  Array.from(files).forEach((file) => {
    const reader = new FileReader();

    // Display the image preview
    reader.onload = function (event) {
      const imgElement = document.createElement("img");
      imgElement.src = event.target.result;
      imgElement.alt = file.name;
      imgElement.style.maxWidth = "150px";
      imgElement.style.margin = "10px";
      preview.appendChild(imgElement);

      // Extract EXIF metadata using EXIF.js
      EXIF.getData(file, function () {
        const allMetaData = EXIF.getAllTags(this);
        metadataOutput.value += `Metadata for ${file.name}:\n`;

        if (Object.keys(allMetaData).length > 0) {
          // EXIF metadata is available
          for (let tag in allMetaData) {
            // Skip User Comment and Maker Note
            if (tag !== "UserComment" && tag !== "MakerNote") {
              metadataOutput.value += `${tag}: ${allMetaData[tag]}\n`;
            }
          }
        } else {
          // Handle other metadata when EXIF is not found
          metadataOutput.value +=
            "No EXIF metadata found. Extracting basic metadata:\n";
          extractBasicMetadata(file, event.target.result);
        }
        metadataOutput.value += "\n"; // Add space between image metadata
      });
    };

    reader.readAsDataURL(file);
  });
}

// Function to extract basic metadata for PNGs and screenshots
function extractBasicMetadata(file, fileDataUrl) {
  const metadataOutput = document.getElementById("metadata-output");

  // Get file size in KB
  const fileSizeKB = (file.size / 1024).toFixed(2);

  // Create a new image object to get dimensions
  const image = new Image();
  image.src = fileDataUrl;
  image.onload = function () {
    // Extract width and height
    const width = image.naturalWidth;
    const height = image.naturalHeight;

    // Write basic metadata to output
    metadataOutput.value += `File Name: ${file.name}\n`;
    metadataOutput.value += `File Size: ${fileSizeKB} KB\n`;
    metadataOutput.value += `Image Dimensions: ${width} x ${height} pixels\n`;
  };

  // MIME type (image type)
  metadataOutput.value += `MIME Type: ${file.type}\n`;
}
