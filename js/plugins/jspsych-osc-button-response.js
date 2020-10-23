/**
 * jspsych-osc-button-response
 * Max Henry
 *
 * plugin for JND experiments with web audio oscillators
 *
 * with apologies to Josh de Leeuw.
 *
 **/

jsPsych.plugins['osc-button-response'] = (function(){

  var plugin = {};

  plugin.info = {
    name: 'osc-button-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Oscillator parameters',
        default: undefined,
        array: true,
        description: 'Parameters of oscillators to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      margin_vertical: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin vertical',
        default: '0px',
        description: 'The vertical margin of the button.'
      },
      margin_horizontal: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Margin horizontal',
        default: '8px',
        description: 'The horizontal margin of the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var audioContext = new AudioContext();


    // The play button. TODO: make prettier.
    var html = '<button id="jspsych-start-osc-button">Play</button>'

    // '<div id="jspsych-html-button-response-stimulus">'+renderedStimulus+'</div>';

    //display buttons
    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    html += '<div id="jspsych-html-button-response-btngroup">';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      html += '<div class="jspsych-html-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }
    html += '</div>';

    //show prompt if there is one
    if (trial.prompt !== null) {
      html += trial.prompt;
    }
    display_element.innerHTML = html;

    // start time
    var start_time = performance.now();

    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
      display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('click', function(e){
        var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
        after_response(choice);
      });
    }

    window.onkeydown = function(event){
        if(event.keyCode === 32) {
            event.preventDefault();
            display_element.querySelector('#jspsych-start-osc-button').click(); // Allow spacebar to press play.
        }
    };

    display_element.querySelector('#jspsych-start-osc-button').addEventListener('click', function(e){
      twoBeeps.apply(this, trial.stimulus);
      this.disabled = true;
    });

    // store response
    var response = {
      rt: null,
      button: null
    };



    // FUNCTIONS.

    function twoBeeps(noteDuration, f0, modDepth, modFreq, deltaModFreq) {
      let beatDuration = noteDuration + 1.0;
      let startTime = audioContext.currentTime;
      let random = Math.round(Math.random())  // random 0, 1.
      let order = [random, 1-random]          // clumsy way to randomize the vibrato order.

      for (var i = 0; i < 2; i++) {
        let time = startTime + i * beatDuration;
        play(time, noteDuration, f0, modDepth, modFreq + order[i] * deltaModFreq);
      }
    }

    function play(time, noteDuration, f0, modDepth, modFreq) {
      // TODO: ramp in and out.

      masterGain = audioContext.createGain();
      masterGain.gain.setValueAtTime(0, time);

      osc = audioContext.createOscillator();
      osc.frequency.value = f0;

      lfo = audioContext.createOscillator();
      lfo.frequency.value = modFreq;

      lfoGain = audioContext.createGain();
      lfoGain.gain.value = modDepth;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(masterGain)
      masterGain.connect(audioContext.destination);

      osc.start(time);
      lfo.start(time);
      masterGain.gain.exponentialRampToValueAtTime(1.0, time + 0.10);

      osc.stop(time + noteDuration);
      lfo.stop(time + noteDuration);

  }


    // function to handle responses by the subject
    function after_response(choice) {

      osc.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();

      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-start-osc-button').className += ' responded';

      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-html-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "button_pressed": response.button
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // // hide image if timing is set
    // if (trial.stimulus_duration !== null) {
    //   jsPsych.pluginAPI.setTimeout(function() {
    //     display_element.querySelector('#jspsych-html-button-response-stimulus').style.visibility = 'hidden';
    //   }, trial.stimulus_duration);
    // }

    // end trial if time limit is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();