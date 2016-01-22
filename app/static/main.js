/*
    main.js - part of 'asana-view'. (C) 2014 OMNIvision, MIT Licence
    ----------------------------------------------------------------
    Pull the data from our asanaview server, display it as HTML.
*/
(function () {
"use strict";

var _jobs = {};
//    _sound = new Audio(__SOUND__);

function sortjob(job){
    // returns a string which can be used for sorting each job sensibly.
    var total = 0;
    if (job.section == 'P1')
        return 'b' + Date.parse(job.due_on);
    if (job.section == 'P2')
        return 'c' + Date.parse(job.due_on);
    if (job.section == 'P3')
        return 'd' + Date.parse(job.due_on);
    else
        return 'a';
}



function job_html(job) {
    // HTML Template.
    console.log(job.name);
    return ( '<div class="task ' + (job.section ? job.section : 'P0') + '" ' +
                  'id="' + job.id + '" ' +
                  'data-sortpos="'+sortjob(job)+'">' +
                  '<div class="info">' +
                 ( job.assignee ?  '<h1>' + __USERS__[job.assignee.id].name.split(' ')[0] + '</h1>' : '<h1>???</h1>') +
                 '<h2 class="priority ' + ( job.section ?  job.section + '">' + job.section : 'unknown>?' ) +  '</h2>' +
                 '</div>' +
                 '<div class="details">' +
                     '<h3>' + job.name + '</h3>' +
//                     (job.project ? ('<h3>' + job.project.name + '</h3>'): 'unknown') +
             '</div></div>' );
}

function get_latest() {
    // ask the asanaview server for new data, then update all jobs which need updating,
    // delete any which no longer exist, and add any new ones.

    $.getJSON(__JOBS_API__ + "?" + Date.now() , function(data) {
        try {
            var i, x, current, id,
                remove_index,
                to_remove = Object.keys(_jobs), // to make removing easier...
                projects = $('#projects'),
                to_add = [];

            for(i=0;i<data['tasks'].length;i++) {
                // loop local vars:
                current = data['tasks'][i];
                id = current.id + '_' + (current.project? current.project.id: 'unknown');
                console.log(id);
                
                // This item is in the new data, so we don't need to remove it:
                remove_index = to_remove.indexOf(id);
                if (remove_index > -1) {
                    to_remove.splice(remove_index, 1);
                }

                // And check for updates to the item:

                if (_jobs.hasOwnProperty(id)) {
                    if ( JSON.stringify(current) !== JSON.stringify(_jobs[id].data) ) {
                        // Item still here, but changed!

                        if ((current.time_class == 'past') &&
                            (_jobs[id].data.time_class !== 'past')) {
                            // here's a little sarcasm...
                            //_sound.play();
                         }

                        _jobs[id].data = current;

                        _jobs[id].el.remove();

                        x = $(job_html(current));
                        _jobs[id].el = x;

                        projects.append(x);
                    }
                } else {
                    // New item:

                    x = $(job_html(current));
                    _jobs[id] = { data: current, el: x };

                    projects.append(x);
                }
            }

            // Now remove any items which aren't in the latest list:

            window.j = _jobs;

            for (i=0; i< to_remove.length; i++) {
                _jobs[to_remove[i]].el.remove();
                delete _jobs[to_remove[i]];

            }

            $('#projects .task').tsort({'order':'asc', attr:'data-sortpos'});

        } catch (e) {
            console.log('ERROR:', e);
        }

        setTimeout(get_latest, 20000);
    }).fail(function() { setTimeout(get_latest, 120000); });;
}

// exports:
window.get_latest = get_latest;
})();
