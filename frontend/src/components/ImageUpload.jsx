import React, { useState } from "react";

export default function ImageUpload({ onChange }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    onChange(f);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold">Upload Image</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {file && <p className="text-green-600">Selected: {file.name}</p>}
    </div>
  );
}
