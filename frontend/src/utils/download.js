// Shared helper for downloading files that live behind the API's auth
// middleware (assignment attachments, submission files, ...). A plain
// <a href="/api/..."> cannot carry the Authorization header, so we fetch
// the file as a blob with the token attached and hand the browser a
// throwaway object URL to save instead.

const RAW_API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Backend file URLs start with /api/..., so use the backend origin.
const API_ORIGIN = RAW_API_BASE.replace(/\/api\/?$/, "");

function getToken() {
  return (
    localStorage.getItem("osta_token") ||
    localStorage.getItem("token")
  );
}

export async function downloadAuthenticatedFile(path, filename) {
  const token = getToken();

  const url = /^https?:\/\//i.test(path)
    ? path
    : `${API_ORIGIN}${path}`;

  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    let message = "Failed to download file.";

    try {
      const data = await response.json();
      message = data?.message || message;
    } catch {
      // Keep the default message for non-JSON responses.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(blobUrl);
}
