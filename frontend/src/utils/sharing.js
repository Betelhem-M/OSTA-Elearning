export function buildShareUrl(network, url, title) {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)

    switch (network) {
        case 'linkedin':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        case 'twitter':
            return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        default:
            return url
    }
}

export function openShareWindow(url) {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500')
}

export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}