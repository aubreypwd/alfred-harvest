import { apiCall } from './utils/helpers';
import { notify } from './utils/notifications';

const vars = process.env;
const { action, goTo, taskId, taskNotes, requestMethod, taskHours, query } = vars;
const stopRestart = vars.stopRestart || '';

let url = `https://api.harvestapp.com/v2/time_entries/${taskId}/${stopRestart}`;

if (action === 'note' || action === 'note-current-timer') {
    const prevNote = taskNotes || '';
    const newNote = query || process.argv[2].replace(/– /g, '\n– ')
    const note = encodeURIComponent(`${prevNote}${newNote}`);
    url = `https://api.harvestapp.com/v2/time_entries/${taskId}?notes=${note}`;
}

if (action === 'adjust-timer') {
    url = `https://api.harvestapp.com/v2/time_entries/${taskId}?hours=${taskHours}`;
}

// bail when user is 'redirected' to other command
if (!goTo) {

    await apiCall(url, requestMethod)
        .then(response => {
            if (action === 'note' || action === 'note-current-timer') {
                notify(
                    'Harvest note updated!',
                    response.notes
                );
            }
            else if (action === 'adjust-timer') {
                notify(
                    'Harvest timer adjusted!',
                    `Hours: ${response.hours}`
                );
            }
            else if (stopRestart === 'stop') {
                notify(
                    'Harvest timer stopped!',
                    `${response.project.name}, ${response.task.name}`
                );
            }
            else if (stopRestart === 'restart') {
                notify(
                    'Harvest timer started!',
                    `${response.project.name}, ${response.task.name}`
                );
            }
            else {
                notify(
                    'Harvest timer updated!'
                );
            }
        })
        .catch(error => {
            notify(
                'Failed to update task.',
                'Check your network connection and try again.'
            );
        });
}
