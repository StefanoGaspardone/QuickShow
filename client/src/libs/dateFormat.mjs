import dayjs from 'dayjs';

const dateFormat = (date) => {
    return dayjs(date).toDate().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });
}

export default dateFormat;