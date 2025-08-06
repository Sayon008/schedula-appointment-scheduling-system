export function formatTime(date: Date): string{
    return date.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour:'2-digit',
        minute:'2-digit',
        hour12:true
    });
}