$(document).ready(function() {

    $(function() {
        $('#select').change(function(){
            $('.gethidden').hide();
            $('#' + $(this).val()).show();
        });
    });

     $(function() {
        $('#select-one').change(function(){
            $('.gethidden-x').hide();
            $('.wine').hide();

            $('#' + $(this).val()).show();
        });
    });
    
  
/* ian js*/


        var Cal = function(divId) {

  //Store div id
  this.divId = divId;

  // Days of week, starting on Sunday
  this.DaysOfWeek = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  // Months, stating on January
  this.Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

  // Set the current month, year
  var d = new Date();

  this.currMonth = d.getMonth();
  this.currYear = d.getFullYear();
  this.currDay = d.getDate();

};

// Goes to next month
Cal.prototype.nextMonth = function() {
  if ( this.currMonth == 11 ) {
    this.currMonth = 0;
    this.currYear = this.currYear + 1;
  }
  else {
    this.currMonth = this.currMonth + 1;
  }
  this.showcurr();
};

// Goes to previous month
Cal.prototype.previousMonth = function() {
  if ( this.currMonth == 0 ) {
    this.currMonth = 11;
    this.currYear = this.currYear - 1;
  }
  else {
    this.currMonth = this.currMonth - 1;
  }
  this.showcurr();
};

// Show current month
Cal.prototype.showcurr = function() {
  this.showMonth(this.currYear, this.currMonth);
};

// Show month (year, month)
Cal.prototype.showMonth = function(y, m) {

  var d = new Date()
  // First day of the week in the selected month
  , firstDayOfMonth = new Date(y, m, 1).getDay()
  // Last day of the selected month
  , lastDateOfMonth =  new Date(y, m+1, 0).getDate()
  // Last day of the previous month
  , lastDayOfLastMonth = m == 0 ? new Date(y-1, 11, 0).getDate() : new Date(y, m, 0).getDate();


  var html = '<table>';

  // Write selected month and year
  html += '<thead><tr>';
  html += '<td colspan="7">' + this.Months[m] + ' ' + y + '</td>';
  html += '</tr></thead>';


  // Write the header of the days of the week
  html += '<tr class="days">';
  for(var i=0; i < this.DaysOfWeek.length;i++) {
    html += '<td>' + this.DaysOfWeek[i] + '</td>';
  }
  html += '</tr>';

  // Write the days
  var i=1;
  do {

    var dow = new Date(y, m, i).getDay();

    // If Sunday, start new row
    if ( dow == 0 ) {
      html += '<tr>';
    }
    // If not Sunday but first day of the month
    // it will write the last days from the previous month
    else if ( i == 1 ) {
      html += '<tr>';
      var k = lastDayOfLastMonth - firstDayOfMonth+1;
      for(var j=0; j < firstDayOfMonth; j++) {
        html += '<td class="not-current">' + k + '</td>';
        k++;
      }
    }

    // Write the current day in the loop
    var chk = new Date();
    var chkY = chk.getFullYear();
    var chkM = chk.getMonth();
    if (chkY == this.currYear && chkM == this.currMonth && i == this.currDay) {
      html += '<td class="today">' + i + '</td>';
    } else {
      html += '<td class="normal">' + i + '</td>';
    }
    // If Saturday, closes the row
    if ( dow == 6 ) {
      html += '</tr>';
    }
    // If not Saturday, but last day of the selected month
    // it will write the next few days from the next month
    else if ( i == lastDateOfMonth ) {
      var k=1;
      for(dow; dow < 6; dow++) {
        html += '<td class="not-current">' + k + '</td>';
        k++;
      }
    }

    i++;
  }while(i <= lastDateOfMonth);

  // Closes table
  html += '</table>';

  // Write HTML to the div
  document.getElementById(this.divId).innerHTML = html;
};

// On Load of the window
window.onload = function() {

  // Start calendar
  var c = new Cal("divCal");      
  c.showcurr();

  // Bind next and previous button clicks
  getId('btnNext').onclick = function() {
    c.nextMonth();
  };
  getId('btnPrev').onclick = function() {
    c.previousMonth();
  };
}

// Get element by id
function getId(id) {
  return document.getElementById(id);
}


/*schedule*/
jQuery(document).ready(function($){
    var transitionEnd = 'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend';
    var transitionsSupported = ( $('.csstransitions').length > 0 );
    //if browser does not support transitions - use a different event to trigger them
    if( !transitionsSupported ) transitionEnd = 'noTransition';
    
    //should add a loding while the events are organized 

    function SchedulePlan( element ) {
        this.element = element;
        this.timeline = this.element.find('.timeline');
        this.timelineItems = this.timeline.find('li');
        this.timelineItemsNumber = this.timelineItems.length;
        this.timelineStart = getScheduleTimestamp(this.timelineItems.eq(0).text());
        //need to store delta (in our case half hour) timestamp
        this.timelineUnitDuration = getScheduleTimestamp(this.timelineItems.eq(1).text()) - getScheduleTimestamp(this.timelineItems.eq(0).text());

        this.eventsWrapper = this.element.find('.events');
        this.eventsGroup = this.eventsWrapper.find('.events-group');
        this.singleEvents = this.eventsGroup.find('.single-event');
        this.eventSlotHeight = this.eventsGroup.eq(0).children('.top-info').outerHeight();

        this.modal = this.element.find('.event-modal');
        this.modalHeader = this.modal.find('.header');
        this.modalHeaderBg = this.modal.find('.header-bg');
        this.modalBody = this.modal.find('.body'); 
        this.modalBodyBg = this.modal.find('.body-bg'); 
        this.modalMaxWidth = 800;
        this.modalMaxHeight = 480;

        this.animating = false;

        this.initSchedule();
    }

    SchedulePlan.prototype.initSchedule = function() {
        this.scheduleReset();
        this.initEvents();
    };

    SchedulePlan.prototype.scheduleReset = function() {
        var mq = this.mq();
        if( mq == 'desktop' && !this.element.hasClass('js-full') ) {
            //in this case you are on a desktop version (first load or resize from mobile)
            this.eventSlotHeight = this.eventsGroup.eq(0).children('.top-info').outerHeight();
            this.element.addClass('js-full');
            this.placeEvents();
            this.element.hasClass('modal-is-open') && this.checkEventModal();
        } else if(  mq == 'mobile' && this.element.hasClass('js-full') ) {
            //in this case you are on a mobile version (first load or resize from desktop)
            this.element.removeClass('js-full loading');
            this.eventsGroup.children('ul').add(this.singleEvents).removeAttr('style');
            this.eventsWrapper.children('.grid-line').remove();
            this.element.hasClass('modal-is-open') && this.checkEventModal();
        } else if( mq == 'desktop' && this.element.hasClass('modal-is-open')){
            //on a mobile version with modal open - need to resize/move modal window
            this.checkEventModal('desktop');
            this.element.removeClass('loading');
        } else {
            this.element.removeClass('loading');
        }
    };

    SchedulePlan.prototype.initEvents = function() {
        var self = this;

        this.singleEvents.each(function(){
            //create the .event-date element for each event
            var durationLabel = '<span class="event-date">'+$(this).data('start')+' - '+$(this).data('end')+'</span>';
            $(this).children('a').prepend($(durationLabel));

            //detect click on the event and open the modal
            $(this).on('click', 'a', function(event){
                event.preventDefault();
                if( !self.animating ) self.openModal($(this));
            });
        });

        //close modal window
        this.modal.on('click', '.close', function(event){
            event.preventDefault();
            if( !self.animating ) self.closeModal(self.eventsGroup.find('.selected-event'));
        });
        this.element.on('click', '.cover-layer', function(event){
            if( !self.animating && self.element.hasClass('modal-is-open') ) self.closeModal(self.eventsGroup.find('.selected-event'));
        });
    };

    SchedulePlan.prototype.placeEvents = function() {
        var self = this;
        this.singleEvents.each(function(){
            //place each event in the grid -> need to set top position and height
            var start = getScheduleTimestamp($(this).attr('data-start')),
                duration = getScheduleTimestamp($(this).attr('data-end')) - start;

            var eventTop = self.eventSlotHeight*(start - self.timelineStart)/self.timelineUnitDuration,
                eventHeight = self.eventSlotHeight*duration/self.timelineUnitDuration;
            
            $(this).css({
                top: (eventTop -1) +'px',
                height: (eventHeight+1)+'px'
            });
        });

        this.element.removeClass('loading');
    };

    SchedulePlan.prototype.openModal = function(event) {
        var self = this;
        var mq = self.mq();
        this.animating = true;

        //update event name and time
        this.modalHeader.find('.event-name').text(event.find('.event-name').text());
        this.modalHeader.find('.event-date').text(event.find('.event-date').text());
        this.modal.attr('data-event', event.parent().attr('data-event'));

        //update event content
        this.modalBody.find('.event-info').load(event.parent().attr('data-content')+'.html .event-info > *', function(data){
            //once the event content has been loaded
            self.element.addClass('content-loaded');
        });

        this.element.addClass('modal-is-open');

        setTimeout(function(){
            //fixes a flash when an event is selected - desktop version only
            event.parent('li').addClass('selected-event');
        }, 10);

        if( mq == 'mobile' ) {
            self.modal.one(transitionEnd, function(){
                self.modal.off(transitionEnd);
                self.animating = false;
            });
        } else {
            var eventTop = event.offset().top - $(window).scrollTop(),
                eventLeft = event.offset().left,
                eventHeight = event.innerHeight(),
                eventWidth = event.innerWidth();

            var windowWidth = $(window).width(),
                windowHeight = $(window).height();

            var modalWidth = ( windowWidth*.8 > self.modalMaxWidth ) ? self.modalMaxWidth : windowWidth*.8,
                modalHeight = ( windowHeight*.8 > self.modalMaxHeight ) ? self.modalMaxHeight : windowHeight*.8;

            var modalTranslateX = parseInt((windowWidth - modalWidth)/2 - eventLeft),
                modalTranslateY = parseInt((windowHeight - modalHeight)/2 - eventTop);
            
            var HeaderBgScaleY = modalHeight/eventHeight,
                BodyBgScaleX = (modalWidth - eventWidth);

            //change modal height/width and translate it
            self.modal.css({
                top: eventTop+'px',
                left: eventLeft+'px',
                height: modalHeight+'px',
                width: modalWidth+'px',
            });
            transformElement(self.modal, 'translateY('+modalTranslateY+'px) translateX('+modalTranslateX+'px)');

            //set modalHeader width
            self.modalHeader.css({
                width: eventWidth+'px',
            });
            //set modalBody left margin
            self.modalBody.css({
                marginLeft: eventWidth+'px',
            });

            //change modalBodyBg height/width ans scale it
            self.modalBodyBg.css({
                height: eventHeight+'px',
                width: '1px',
            });
            transformElement(self.modalBodyBg, 'scaleY('+HeaderBgScaleY+') scaleX('+BodyBgScaleX+')');

            //change modal modalHeaderBg height/width and scale it
            self.modalHeaderBg.css({
                height: eventHeight+'px',
                width: eventWidth+'px',
            });
            transformElement(self.modalHeaderBg, 'scaleY('+HeaderBgScaleY+')');
            
            self.modalHeaderBg.one(transitionEnd, function(){
                //wait for the  end of the modalHeaderBg transformation and show the modal content
                self.modalHeaderBg.off(transitionEnd);
                self.animating = false;
                self.element.addClass('animation-completed');
            });
        }

        //if browser do not support transitions -> no need to wait for the end of it
        if( !transitionsSupported ) self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
    };

    SchedulePlan.prototype.closeModal = function(event) {
        var self = this;
        var mq = self.mq();

        this.animating = true;

        if( mq == 'mobile' ) {
            this.element.removeClass('modal-is-open');
            this.modal.one(transitionEnd, function(){
                self.modal.off(transitionEnd);
                self.animating = false;
                self.element.removeClass('content-loaded');
                event.removeClass('selected-event');
            });
        } else {
            var eventTop = event.offset().top - $(window).scrollTop(),
                eventLeft = event.offset().left,
                eventHeight = event.innerHeight(),
                eventWidth = event.innerWidth();

            var modalTop = Number(self.modal.css('top').replace('px', '')),
                modalLeft = Number(self.modal.css('left').replace('px', ''));

            var modalTranslateX = eventLeft - modalLeft,
                modalTranslateY = eventTop - modalTop;

            self.element.removeClass('animation-completed modal-is-open');

            //change modal width/height and translate it
            this.modal.css({
                width: eventWidth+'px',
                height: eventHeight+'px'
            });
            transformElement(self.modal, 'translateX('+modalTranslateX+'px) translateY('+modalTranslateY+'px)');
            
            //scale down modalBodyBg element
            transformElement(self.modalBodyBg, 'scaleX(0) scaleY(1)');
            //scale down modalHeaderBg element
            transformElement(self.modalHeaderBg, 'scaleY(1)');

            this.modalHeaderBg.one(transitionEnd, function(){
                //wait for the  end of the modalHeaderBg transformation and reset modal style
                self.modalHeaderBg.off(transitionEnd);
                self.modal.addClass('no-transition');
                setTimeout(function(){
                    self.modal.add(self.modalHeader).add(self.modalBody).add(self.modalHeaderBg).add(self.modalBodyBg).attr('style', '');
                }, 10);
                setTimeout(function(){
                    self.modal.removeClass('no-transition');
                }, 20);

                self.animating = false;
                self.element.removeClass('content-loaded');
                event.removeClass('selected-event');
            });
        }

        //browser do not support transitions -> no need to wait for the end of it
        if( !transitionsSupported ) self.modal.add(self.modalHeaderBg).trigger(transitionEnd);
    }

    SchedulePlan.prototype.mq = function(){
        //get MQ value ('desktop' or 'mobile') 
        var self = this;
        return window.getComputedStyle(this.element.get(0), '::before').getPropertyValue('content').replace(/["']/g, '');
    };

    SchedulePlan.prototype.checkEventModal = function(device) {
        this.animating = true;
        var self = this;
        var mq = this.mq();

        if( mq == 'mobile' ) {
            //reset modal style on mobile
            self.modal.add(self.modalHeader).add(self.modalHeaderBg).add(self.modalBody).add(self.modalBodyBg).attr('style', '');
            self.modal.removeClass('no-transition');    
            self.animating = false; 
        } else if( mq == 'desktop' && self.element.hasClass('modal-is-open') ) {
            self.modal.addClass('no-transition');
            self.element.addClass('animation-completed');
            var event = self.eventsGroup.find('.selected-event');

            var eventTop = event.offset().top - $(window).scrollTop(),
                eventLeft = event.offset().left,
                eventHeight = event.innerHeight(),
                eventWidth = event.innerWidth();

            var windowWidth = $(window).width(),
                windowHeight = $(window).height();

            var modalWidth = ( windowWidth*.8 > self.modalMaxWidth ) ? self.modalMaxWidth : windowWidth*.8,
                modalHeight = ( windowHeight*.8 > self.modalMaxHeight ) ? self.modalMaxHeight : windowHeight*.8;

            var HeaderBgScaleY = modalHeight/eventHeight,
                BodyBgScaleX = (modalWidth - eventWidth);

            setTimeout(function(){
                self.modal.css({
                    width: modalWidth+'px',
                    height: modalHeight+'px',
                    top: (windowHeight/2 - modalHeight/2)+'px',
                    left: (windowWidth/2 - modalWidth/2)+'px',
                });
                transformElement(self.modal, 'translateY(0) translateX(0)');
                //change modal modalBodyBg height/width
                self.modalBodyBg.css({
                    height: modalHeight+'px',
                    width: '1px',
                });
                transformElement(self.modalBodyBg, 'scaleX('+BodyBgScaleX+')');
                //set modalHeader width
                self.modalHeader.css({
                    width: eventWidth+'px',
                });
                //set modalBody left margin
                self.modalBody.css({
                    marginLeft: eventWidth+'px',
                });
                //change modal modalHeaderBg height/width and scale it
                self.modalHeaderBg.css({
                    height: eventHeight+'px',
                    width: eventWidth+'px',
                });
                transformElement(self.modalHeaderBg, 'scaleY('+HeaderBgScaleY+')');
            }, 10);

            setTimeout(function(){
                self.modal.removeClass('no-transition');
                self.animating = false; 
            }, 20);
        }
    };

    var schedules = $('.cd-schedule');
    var objSchedulesPlan = [],
        windowResize = false;
    
    if( schedules.length > 0 ) {
        schedules.each(function(){
            //create SchedulePlan objects
            objSchedulesPlan.push(new SchedulePlan($(this)));
        });
    }

    $(window).on('resize', function(){
        if( !windowResize ) {
            windowResize = true;
            (!window.requestAnimationFrame) ? setTimeout(checkResize) : window.requestAnimationFrame(checkResize);
        }
    });

    $(window).keyup(function(event) {
        if (event.keyCode == 47) {
            objSchedulesPlan.forEach(function(element){
                element.closeModal(element.eventsGroup.find('.selected-event'));
            });
        }
    });

    function checkResize(){
        objSchedulesPlan.forEach(function(element){
            element.scheduleReset();
        });
        windowResize = false;
    }

    function getScheduleTimestamp(time) {
        //accepts hh:mm format - convert hh:mm to timestamp
        time = time.replace(/ /g,'');
        var timeArray = time.split(':');
        var timeStamp = parseInt(timeArray[0])*60 + parseInt(timeArray[1]);
        return timeStamp;
    }

    function transformElement(element, value) {
        element.css({
            '-moz-transform': value,
            '-webkit-transform': value,
            '-ms-transform': value,
            '-o-transform': value,
            'transform': value
        });
    }
});


/* Get Date*/
$(document).ready(function() {
// Create two variables with names of months and days of the week in the array
var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
var dayNames= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

// Create an object newDate()
var newDate = new Date();
// Retrieve the current date from the Date object
newDate.setDate(newDate.getDate());
// At the output of the day, date, month and year    
$('#Date').html(dayNames[newDate.getDay()] + " " + newDate.getDate() + ' ' + monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear());

setInterval( function() {
    // Create an object newDate () and extract the second of the current time
    var seconds = new Date().getSeconds();
    // Add a leading zero to the value of seconds
    $("#sec").html(( seconds < 10 ? "0" : "" ) + seconds);
    },1000);
    
setInterval( function() {
    // Create an object newDate () and extract the minutes of the current time
    var minutes = new Date().getMinutes();
    // Add a leading zero to the minutes
    $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
    },1000);
    
setInterval( function() {
    // Create an object newDate () and extract the clock from the current time
    var hours = new Date().getHours();
    // Add a leading zero to the value of hours
    $("#hours").html(( hours < 10 ? "0" : "" ) + hours);
    }, 1000);
    
}); 



}); 


$("#buttontoCalendar").click(function() {
    $('html, body').animate({
        scrollTop: $("#calendar-wrapper").offset().top
    }, 2000);
});

//Add break btn  

$('textarea').keyup(updateCount);
$('textarea').keydown(updateCount);

function updateCount() {
    var cs = $(this).val().length;
    $('#characters').text(cs);
}

var edit_add_break = document.getElementById('edit_add_break');
var add_break = document.getElementById('add_break');
edit_add_break.onclick = function() {
    add_break.removeAttribute("hidden"); 
}

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: [ 'interaction', 'dayGrid', 'timeGrid' ],
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      defaultDate: '2019-06-12',
      navLinks: true, // can click day/week names to navigate views
      selectable: true,
      selectMirror: true,
      select: function(arg) {
        var title = prompt('Event Title:');
        if (title) {
          calendar.addEvent({
            title: title,
            start: arg.start,
            end: arg.end,
            allDay: arg.allDay
          })
        }
        calendar.unselect()
      },
      editable: true,
      eventLimit: true, // allow "more" link when too many events
      events: [
        {
          title: 'All Day Event',
          start: '2019-06-01'
        },
        {
          title: 'Long Event',
          start: '2019-06-07',
          end: '2019-06-10'
        },
        {
          groupId: 999,
          title: 'Repeating Event',
          start: '2019-06-09T16:00:00'
        },
        {
          groupId: 999,
          title: 'Repeating Event',
          start: '2019-06-16T16:00:00'
        },
        {
          title: 'Conference',
          start: '2019-06-11',
          end: '2019-06-13'
        },
        {
          title: 'Conference2',
          start: '2019-06-11',
          end: '2019-06-13'
        },
        {
          title: 'Conference3',
          start: '2019-06-11',
          end: '2019-06-13'
        },
        {
          title: 'Meeting',
          start: '2019-06-12T10:30:00',
          end: '2019-06-12T12:30:00'
        },
        {
          title: 'Lunch',
          start: '2019-06-12T12:00:00'
        },
        {
          title: 'Meeting',
          start: '2019-06-12T14:30:00'
        },
        {
          title: 'Happy Hour',
          start: '2019-06-12T17:30:00'
        },
        {
          title: 'Dinner',
          start: '2019-06-12T20:00:00'
        },
        {
          title: 'Birthday Party',
          start: '2019-06-13T07:00:00'
        },
        {
          title: 'Click for Google',
          url: 'http://google.com/',
          start: '2019-06-28'
        }
      ]
    });

    calendar.render();
  });

  /* dropdown checkbox */
  var checkList = document.getElementById('list1');
var items = document.getElementById('items');
checkList.getElementsByClassName('anchor')[0].onclick = function(evt) {
  if (items.classList.contains('visible')) {
    items.classList.remove('visible');
    items.style.display = "none";
  } else {
    items.classList.add('visible');
    items.style.display = "block";
  }

}

items.onblur = function(evt) {
  items.classList.remove('visible');
}

  var checkList2 = document.getElementById('list2');
var items2 = document.getElementById('items2');
checkList2.getElementsByClassName('anchor2')[0].onclick = function(evt) {
  if (items2.classList2.contains('visible')) {
    items2.classList2.remove('visible');
    items2.style.display = "none";
  } else {
    items2.classList.add('visible');
    items2.style.display = "block";
  }

}

items.onblur = function(evt) {
  items2.classList.remove('visible');
}
