// Generated by CoffeeScript 1.10.0
(function() {
  var addSwipeEventToOpenServerList, onAddServerClick, onServerClick, onServerDeleteClick;

  addSwipeEventToOpenServerList = function($el) {
    var started;
    started = void 0;
    $el.on('touchstart', function(e) {
      if (e.originalEvent.touches.length === 2) {
        return started = {
          date: Date.now(),
          pageX: e.originalEvent.touches[0].pageX,
          pageY: e.originalEvent.touches[0].pageY
        };
      }
    });
    $el.on('touchmove', function(e) {
      if (started != null) {
        if (Date.now() - started.date < 2000) {
          if (Math.abs(e.originalEvent.touches[0].pageX - started.pageX) < 50) {
            if (Math.abs(e.originalEvent.touches[0].pageY - started.pageY) > 100) {
              toggleServerList();
              return started = void 0;
            }
          }
        }
      }
    });
    return $el.on('touchend', function(e) {
      return started = void 0;
    });
  };

  window.toggleServerList = function(open) {
    if (open === true) {
      return $(document.body).addClass('server-list-open');
    } else if (open === false) {
      return $(document.body).removeClass('server-list-open');
    } else {
      return $(document.body).toggleClass('server-list-open');
    }
  };

  window.refreshServerList = function() {
    var i, len, li, ref, server, serverList, ul;
    serverList = document.querySelector("#serverList");
    if (serverList != null) {
      serverList.remove();
    }
    serverList = "<div id=\"serverList\">\n	<div class=\"panel\">\n		<div class=\"toggle\">" + (cordovai18n('Server_List')) + "</div>\n		<ul>\n		</ul>\n	</div>\n</div>";
    document.body.appendChild($(serverList)[0]);
    ul = document.querySelector("#serverList ul");
    ref = Servers.getServers();
    for (i = 0, len = ref.length; i < len; i++) {
      server = ref[i];
      li = "<li class=\"server\">\n	<div data-name=\"" + server.name + "\" data-url=\"" + server.url + "\" class=\"name\">" + server.name + "</div>\n	<div data-name=\"" + server.name + "\" data-url=\"" + server.url + "\" class=\"delete-btn\">X</div>\n</li>";
      ul.appendChild($(li)[0]);
    }
    li = document.createElement('LI');
    li.className = 'addServer';
    li.innerText = '+';
    return ul.appendChild(li);
  };

  onServerClick = function(e) {
    var target;
    toggleServerList(false);
    target = $(e.currentTarget);
    $(document.body).addClass('loading');
    $('.loading-text').text(cordovai18n("Loading_s", target.data('name')));
    return setTimeout(function() {
      Servers.setActiveServer(target.data('url'));
      return Servers.startServer(target.data('url'), function() {});
    }, 200);
  };

  onServerDeleteClick = function(e) {
    var onConfirm, target;
    target = $(e.currentTarget);
    onConfirm = function(buttonIndex) {
      var activeServer;
      if (buttonIndex !== 1) {
        return;
      }
      activeServer = Servers.getActiveServer();
      return Servers.deleteServer(target.data('url'), function() {
        if (activeServer.url === target.data('url')) {
          return onAddServerClick();
        } else {
          return refreshServerList();
        }
      });
    };
    return navigator.notification.confirm(cordovai18n("Delete_server_s_question", target.data('name')), onConfirm, cordovai18n("Warning"), [cordovai18n("Delete"), cordovai18n("Cancel")]);
  };

  onAddServerClick = function() {
    return Servers.startLocalServer("index.html?addServer");
  };

  window.addEventListener("onNewVersion", function(e) {
    return Servers.onLoad((function(_this) {
      return function() {
        var onConfirm, server, url, version;
        url = Meteor.absoluteUrl().replace(/\/$/, '');
        version = e.detail;
        server = Servers.getServer(url);
        if (server == null) {
          navigator.notification.alert(cordovai18n("The_URL_configured_in_your_server_s_is_not_the_same_that_you_are_using_here", url), null, cordovai18n("Warning"));
          return;
        }
        if (server.info.version === version) {
          return;
        }
        onConfirm = function(buttonIndex) {
          if (buttonIndex !== 1) {
            return;
          }
          return Servers.startLocalServer("index.html?updateServer=" + (encodeURIComponent(url)) + "&version=" + (encodeURIComponent(version)));
        };
        return navigator.notification.confirm(cordovai18n("There_is_a_new_version_available_do_you_want_to_update_now_question"), onConfirm, cordovai18n("New_version"), [cordovai18n("Update"), cordovai18n("Cancel")]);
      };
    })(this));
  });

  document.addEventListener("deviceready", function() {
    Servers.onLoad(function() {
      return refreshServerList();
    });
    $(document).on('click', '#serverList .server .name', onServerClick);
    $(document).on('click', '#serverList .server .delete-btn', onServerDeleteClick);
    $(document).on('click', '#serverList .addServer', onAddServerClick);
    $(document).on('click', "#serverList", function(e) {
      if ($(e.target).is('#serverList')) {
        return toggleServerList(false);
      }
    });
    return addSwipeEventToOpenServerList($(document));
  });

}).call(this);
