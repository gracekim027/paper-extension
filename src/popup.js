document.getElementById("resetBtn").addEventListener("click", function() {
  chrome.storage.local.set({ navigationTypes: [] });
});

document.getElementById("exportBtn").addEventListener("click", function() {
  chrome.storage.local.get({ navigationTypes: [] }, function (result) {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "\"Navigation Types\"\n"; // CSV Header
      csvContent += result.navigationTypes.join(", ") + "\n"; // Append navigation types

      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "navigation_types.csv");
      document.body.appendChild(link);
      link.click();
  });
});

function escapeCSV(text) {
  // Check if text is null or undefined
  if (text === null || text === undefined) {
      return '';
  }
  // Convert text to string in case it's not and escape double quotes
  return String(text).replace(/"/g, '""');
}
