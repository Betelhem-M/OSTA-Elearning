// Shared helper for downloading files that live behind the API's auth
// middleware (assignment attachments, submission files, ...). A plain
// <a href="/api/..."> can't carry the Authorization header, so we fetch
// the file as a blob with the token attached and hand the browser a
// throwaway object URL to save instead.

const RAW_API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Endpoints returned by the backend (e.g. attachment_url, file.url)
// already start with "/api/...", so the download origin must NOT
// include the trailing "/api" or it would be duplicated.
const API_ORIGIN = RAW_API_BASE.replace(/\/api\/?$/, "");

function getToken() {
  return (
    localStorage.getItem("osta_token") ||
    localStorage.getItem("token")
  );
}

/**
 * Downloads a file from an authenticated API endpoint and saves it
 * with the given filename.
 *
 * @param {string} path - path returned by the API, e.g. "/api/assignments/7/attachment"
 * @param {string} [filename] - suggested filename for the saved file
 */
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
      // response wasn't JSON (e.g. plain 404) — keep the default message
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