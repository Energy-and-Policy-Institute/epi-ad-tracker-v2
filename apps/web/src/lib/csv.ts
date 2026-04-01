export const convertToCsv = <T extends Record<string, unknown>>(data: T[], omit: string[]) => {
  if (!data.length) {
    return "";
  }

  const keys = Object.keys(data[0] ?? {}).filter((key) => !omit.includes(key));
  const rows = data.map((entry) =>
    keys
      .map((key) => {
        const value = entry[key];
        return value == null ? "" : String(value).replaceAll(",", " ");
      })
      .join(",")
  );

  return [keys.join(","), ...rows].join("\n");
};

export const downloadCsv = (csv: string, fileName: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
