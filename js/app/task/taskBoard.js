/**
 * @file
 * Taskboard module for the task creator.
 */
define(['rejs!task/templates/taskboard', 'app/param', 'jquery', 'jquery-ui'], function (taskBoard, param, $) {

  $(document).on('click', '#taskboard li', function (e) {
    var index = $(this).index();
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('openMapTurnpointConfig', false, false, {
      index: index,
    });
    document.dispatchEvent(e);
  });



  $(document).on('click', '#increase-task', function (e) {
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('changeTaskNumber', false, false, {
      forward: true,
    });
    document.dispatchEvent(e);
  });




  $(document).on('click', '#toggle-turn', function (e) {
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('changeTaskTurn', false, false, {});
    document.dispatchEvent(e);
  });


  $(document).on('click', '#decrease-task', function (e) {
    var e = document.createEvent("CustomEvent");
    e.initCustomEvent('changeTaskNumber', false, false, {
      forward: false,
    });
    document.dispatchEvent(e);
  });




  // $(document).on('click', '#change_task_date', function(e) {
  //   $( "#change_task_date" ).datepicker({
  //     showOn: "button",
  //       buttonText: "day"
  //   });
  // });

  function makeItSortable() {
    $("#taskboard ul").sortable({
      start: function (event, ui) {
        ui.item.startIndex = ui.item.index();
      },
      stop: function (event, ui) {
        var oldIndex = ui.item.startIndex;
        var index = ui.item.index();
        var e = document.createEvent("CustomEvent");
        e.initCustomEvent('reorderTurnpoint', false, false, {
          oldIndex: oldIndex,
          index: index,
        });
        document.dispatchEvent(e);
      }
    });
  }

  let showCumulativeDistances = localStorage.getItem('showCumulativeDistances');
  if (showCumulativeDistances != null) {
    param.showCumulativeDistances = showCumulativeDistances;
  }

  var updateDistaceType = function () {
    var link_show_cumulative = $("#show-cumulative");
    if (link_show_cumulative.length > 0) {
      if (param.showCumulativeDistances) {
        link_show_cumulative.html("Cumulative distances");
      }
      else {
        link_show_cumulative.html("Partial distances");
      }
      link_show_cumulative.click(function (e) {
        localStorage.setItem('showCumulativeDistances', !param.showCumulativeDistances);
        param.showCumulativeDistances = !param.showCumulativeDistances;



        if (param.showCumulativeDistances) {
          link_show_cumulative.html("Cumulative distances");
        }
        else {
          link_show_cumulative.html("Partial distances");
        }

        var ev = document.createEvent("CustomEvent");
        ev.initCustomEvent('taskChanged', false, false, {});
        document.dispatchEvent(ev);

      });
    }
  }

  var rebuildTask = function (turnpoints, taskInfo) {
    $("#taskboard-content").html(taskBoard({
      turnpoints: turnpoints,
      taskInfo: taskInfo,
    }));

    makeItSortable();
    updateDistaceType();

  }

  return {
    rebuildTask: rebuildTask,
  }
})
