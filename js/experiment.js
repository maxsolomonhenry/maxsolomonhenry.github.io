// A very simple one-trial experiment to develop a new plugin type.

var instructions = {
	type: "instructions",
	pages: [
		'Welcome.',
		'This program demonstrates generating stimuli in the browser.',
		'Please continue.'
	],
	show_clickable_nav: true
}

// PARAMETERS FOR THRESHOLD ESTIMATION.
const estimationSettings = (function(maxTrials, min, max, numCandidates) {
	settings = {};

	settings.maxTrials = maxTrials;

	settings.candidates = (function(){
		let out = [min];
		let incr = (max - min)/numCandidates;
		for (i = 1; i < numCandidates; i++){
			out.push(out[out.length-1] + incr);
		}
		return out;
	})();

	settings.initThresh = (min + max)/2;
	settings.thresholds = [settings.initThresh];
	settings.responses = [];
	settings.bestCandidate = null;

	return settings;
})(10, 0, 100, 1000);


var trial = {
	type: 'osc-button-response',
	stimulus: [1, 880, 20, 3, estimationSettings.initThresh],  // [noteDuration, f0, modDepth, modFreq, deltaModFreq]
	choices: ['Same', 'Different'],
	prompt: 'Are these two sounds the same?',
	stimulus_duration: 5,
	post_trial_gap: 400
};

// var trial_5 = {
// 	type: 'osc-button-response',
// 	stimulus: [1, 880, 20, 5, estimationSettings.initThresh],  // [noteDuration, f0, modDepth, modFreq, deltaModFreq]
// 	choices: ['Same', 'Different'],
// 	prompt: 'Are these two sounds the same?',
// 	stimulus_duration: 5,
// 	post_trial_gap: 400
// };

// var trial_10 = {
// 	type: 'osc-button-response',
// 	stimulus: [1, 880, 20, 10, estimationSettings.initThresh],  // [noteDuration, f0, modDepth, modFreq, deltaModFreq]
// 	choices: ['Same', 'Different'],
// 	prompt: 'Are these two sounds the same?',
// 	stimulus_duration: 5,
// 	post_trial_gap: 400
// };

// Init repeat counter.
var trialCount = 1;

// funny workaround for multiple consecutive trials.

var baseModFreqs = ((a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
})([3, 5, 7, 9, 11])

var k = 0;


var trial = {
	type: 'osc-button-response',
	stimulus: [1, 880, 20, baseModFreqs[k], estimationSettings.initThresh],  // [noteDuration, f0, modDepth, modFreq, deltaModFreq]
	choices: ['Same', 'Different'],
	prompt: 'Are these two sounds the same?',
	stimulus_duration: 5,
	post_trial_gap: 400
};

var loop_node = {
	timeline: [trial],
	loop_function: function(data){
		if (trialCount === estimationSettings.maxTrials) {
			trial.stimulus[4] = estimationSettings.initThresh; // reset mod.

			k += 1;
			trial.stimulus[3] = baseModFreqs[k];

			trialCount = 1;	// reset trial count.

			estimationSettings.thresholds = [estimationSettings.initThresh];
			estimationSettings.responses = [];
			estimationSettings.bestCandidate = null;

			return false;
		} else {
			// reponse: 0 -> -1; 1 -> 1.
			estimationSettings.responses.push(Math.pow(-1, (1 - parseFloat(data.values()[0].button_pressed))));
			var bestLikelihood = -Infinity;
			estimationSettings.bestCandidate = null;

			for (var candidate of estimationSettings.candidates){
				var likelihood = 0;
				estimationSettings.thresholds.forEach(function (item, index){
					likelihood += -Math.log(1 + Math.exp(-estimationSettings.responses[index]*(estimationSettings.thresholds[index] - candidate)));
				});
				if (likelihood > bestLikelihood) {
					bestLikelihood = likelihood;
					estimationSettings.bestCandidate = candidate;
				}
			}
			estimationSettings.thresholds.push(estimationSettings.bestCandidate);

			// Set next threshold at predicted mean.
			trial.stimulus[4] = estimationSettings.bestCandidate;

			console.log("Setting stimulus to: " + estimationSettings.bestCandidate);
			trialCount += 1;
			return true;
		}
	}
}






var fixation = {
	type: "html-keyboard-response",
	on_start: function (trial) {
		trial.stimulus = "Limen: " + jsPsych.data.get().last(1).values()[0].stimulus[4] + "Hz";
	},
	stimulus: "",
	data: "",
	choices: jsPsych.NO_KEYS,
	trial_duration: 2000,
	post_trial_gap: 250
}

// var trial_procedure = [trial]

timeline = [];
timeline.push(instructions);

for (base of baseModFreqs){

	timeline.push(loop_node);
	timeline.push(fixation);

}

function startExp() {
	jsPsych.init(
		{
		timeline: timeline,
		on_interaction_data_update: function(data){
			var trial = jsPsych.currentTrial();
		},
		use_webaudio: false,
		on_finish: function () 
			{
			console.log('Made it to finish.');
			jsPsych.data.displayData();
			}
	})
	};