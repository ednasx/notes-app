// The four folder-tab colours from direction C
const TAG_COLORS = ["#3B6FD9", "#1F8A7A", "#D9A23B", "#B9501C"]


// Same tag name -> same colour every time. Nothing is stored; it is calculated. 
export function tagColor(tag: string): string {
    let sum = 0
    for (const ch of tag) {
        sum += ch.charCodeAt(0)
    }
    return TAG_COLORS[sum % TAG_COLORS.length]
}