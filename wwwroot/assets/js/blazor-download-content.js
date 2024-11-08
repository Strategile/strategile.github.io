﻿function downloadContent(contentData, filename, contentType) {
	// Create the URL
	const file = new File([contentData], filename, { type: contentType });
	const exportUrl = URL.createObjectURL(file);

	// Create the <a> element and click on it
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.href = exportUrl;
	a.download = filename;
	a.target = "_self";
	a.click();

	// We don't need to keep the object URL, let's release the memory
	// On older versions of Safari, it seems you need to comment this line...
	URL.revokeObjectURL(exportUrl);
}

function downloadContentOnNet50(content, filename, contentType) {
	// Convert the parameters to actual JS types
	filename = BINDING.conv_string(filename) ?? filename;
	contentType = BINDING.conv_string(contentType) ?? contentType;
	const contentData = Blazor.platform.toUint8Array(content);

	downloadContent(contentData, filename, contentType);
}

function downloadContentOnNet31(content, filename, contentType) {
	// Blazor marshall byte[] to a base64 string, so we first need to convert
	// the string (content) to a Uint8Array to create the File
	const contentData = base64DecToArr(content);

	downloadContent(contentData, filename, contentType);
}

function base64DecToArr(sBase64, nBlocksSize) {
	var
		sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""),
		nInLen = sB64Enc.length,
		nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
		taBytes = new Uint8Array(nOutLen);

	for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
		nMod4 = nInIdx & 3;
		nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
		if (nMod4 === 3 || nInLen - nInIdx === 1) {
			for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
				taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
			}
			nUint24 = 0;
		}
	}
	return taBytes;
}

function b64ToUint6(nChr) {
	// Convert a base64 string to a Uint8Array. This is needed to create a blob object from the base64 string.
	// The code comes from: https://developer.mozilla.org/fr/docs/Web/API/WindowBase64/D%C3%A9coder_encoder_en_base64
	return nChr > 64 && nChr < 91 ? nChr - 65 : nChr > 96 && nChr < 123 ? nChr - 71 : nChr > 47 && nChr < 58 ? nChr + 4 : nChr === 43 ? 62 : nChr === 47 ? 63 : 0;
}
