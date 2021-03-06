$(function(){
	var $prefix = $('#prefix');
	var $sufix = $('#sufix');
	var $length = $('#length');
	var $generated = $('#generated');
	var $flag = $('#flag');
	var $alert = $('.alert');
	var $msg = $('#msg');
	var $results = $('#results');
	var $name = $('#name');
	var $cards = $('#cards img');

	var clear_inputs = function(){
		$prefix.val('');
		$sufix.val('');
		$length.val('');
		$results.addClass('hidden');
		$cards.removeClass('selected'); 
		$cards.removeClass('unavailable');
	}
	
	var mark_matching_cards = function(number){
		$cards.removeClass('unavailable');
		$.each(card_types, function(){
			if (!this.pattern.test(number)) {
				var idx = card_types.indexOf(this);
				$($cards[idx]).addClass('unavailable');
			}
		});
	};
	var show_validation = function(result){
		if (result.luhn_valid) {
			$generated.text(result.number);
			$flag.attr('src',"img/" + result.card_type.name + '.png');
			$name.text(camelCase(result.card_type.name));
			
			$results.removeClass('hidden');
			
			// mark card as selected
			$.each(card_types, function(){
				if (this == result.card_type) {
					var idx = card_types.indexOf(this);
					$($cards[idx]).addClass('selected');
				}
			});
		}
		else {
			$alert.removeClass('hidden');
		}
		
		mark_matching_cards(result.number);
	}
	
	var refresh_from_inputs = function(){
		$results.addClass('hidden');$alert.addClass('hidden');

		var prefix = $prefix.val();//ending digits
		var sufix = $sufix.val();//begining digits
		var length = $length.val() -0 || 15;//lenght of cc

		generate(prefix, sufix, length, show_validation);
	};
	
	var refresh_from_image = function(elm){
		clear_inputs();
		$cards.removeClass('selected');
		$(elm).addClass('selected');
		var cardType = card_types[$cards.index(elm)];
		$prefix.val(new RandExp(cardType.pattern).gen());
		$length.val(cardType.valid_length[0]);
		
		refresh_from_inputs();
	};
	
	var copy_to_clipboard = function(){
		clip.setText($generated.text());
	};

	$('input').keyup(function(){
		$cards.removeClass('selected'); 
		$cards.removeClass('unavailable');
		refresh_from_inputs();
	});
	
	$('button').click(function(){clear_inputs(); refresh_from_inputs();});
	$cards.click(function(){refresh_from_image(this);});
	$results.click(copy_to_clipboard);
});

function generate(prefix, sufix, length, result){
	var flag = false;
	var count = 0;

	var getRandom = function(){
		var placesLeft = length - sufix.length - prefix.length;// number of places need to calculate
		var rand = Math.random().toFixed(placesLeft).substr(2);//randomize that many digits
		var number = prefix + rand + sufix;
		return number;
	}

	var validationResult={};
	while(!(validationResult = validateCreditCard((getRandom()))).luhn_valid)
	{
		if (count > 500) return (result || function(){})(validationResult);
		count++;
	}
	
	(result||function(){})(validationResult);
}

var card_types = [
  {
	name: 'amex',
	pattern: /^3[47]/,
	valid_length: [15]
  }, {
	name: 'diners_club_carte_blanche',
	pattern: /^30[0-5]/,
	valid_length: [14]
  }, {
	name: 'diners_club_international',
	pattern: /^36/,
	valid_length: [14]
  }, {
	name: 'jcb',
	pattern: /^35(2[89]|[3-8][0-9])/,
	valid_length: [16]
  }, {
	name: 'laser',
	pattern: /^(6304|670[69]|6771)/,
	valid_length: [16, 17, 18, 19]
  }, {
	name: 'visa_electron',
	pattern: /^(4026|417500|4508|4844|491(3|7))/,
	valid_length: [16]
  }, {
	name: 'visa',
	pattern: /^4/,
	valid_length: [16]
  }, {
	name: 'mastercard',
	pattern: /^5[1-5]/,
	valid_length: [16]
  }, {
	name: 'maestro',
	pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
	valid_length: [12, 13, 14, 15, 16, 17, 18, 19]
  }, {
	name: 'discover',
	pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
	valid_length: [16]
  }
];

var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
var validateCreditCard = function(ccNumber, options) {
    var card, card_type, get_card_type, is_valid_length, is_valid_luhn, normalize, validate, validate_number, _i, _len, _ref;
    
    if (options == null) {
      options = {};
    }
    if (options.accept == null) {
      options.accept = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = card_types.length; _i < _len; _i++) {
          card = card_types[_i];
          _results.push(card.name);
        }
        return _results;
      })();
    }
    _ref = options.accept;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      card_type = _ref[_i];
      if (__indexOf.call((function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = card_types.length; _j < _len1; _j++) {
          card = card_types[_j];
          _results.push(card.name);
        }
        return _results;
      })(), card_type) < 0) {
        throw "Credit card type '" + card_type + "' is not supported";
      }
    }
    get_card_type = function(number) {
      var _j, _len1, _ref1;
      _ref1 = (function() {
        var _k, _len1, _ref1, _results;
        _results = [];
        for (_k = 0, _len1 = card_types.length; _k < _len1; _k++) {
          card = card_types[_k];
          if (_ref1 = card.name, __indexOf.call(options.accept, _ref1) >= 0) {
            _results.push(card);
          }
        }
        return _results;
      })();
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        card_type = _ref1[_j];
        if (number.match(card_type.pattern)) {
          return card_type;
        }
      }
      return null;
    };
    is_valid_luhn = function(number) {
      var digit, n, sum, _j, _len1, _ref1;
      sum = 0;
      _ref1 = number.split('').reverse();
      for (n = _j = 0, _len1 = _ref1.length; _j < _len1; n = ++_j) {
        digit = _ref1[n];
        digit = +digit;
        if (n % 2) {
          digit *= 2;
          if (digit < 10) {
            sum += digit;
          } else {
            sum += digit - 9;
          }
        } else {
          sum += digit;
        }
      }
      return sum % 10 === 0;
    };
    is_valid_length = function(number, card_type) {
      var _ref1;
      return _ref1 = number.length, __indexOf.call(card_type.valid_length, _ref1) >= 0;
    };
    validate_number = function(number) {
      var length_valid, luhn_valid;
      card_type = get_card_type(number);
      luhn_valid = false;
      length_valid = false;
      if (card_type != null) {
        luhn_valid = is_valid_luhn(number);
        length_valid = is_valid_length(number, card_type);
      }
      return {
        card_type: card_type,
        luhn_valid: luhn_valid,
        length_valid: length_valid,
		number: number
      };
    };
    validate = function(ccNumber) {
      var number;
      number = normalize(ccNumber);
      return validate_number(number);
    };
    normalize = function(number) {
      return number.replace(/[ -]/g, '');
    };
    return validate(ccNumber);
  };

function camelCase(input) { 
    return input[0].toUpperCase() + input.substr(1).toLowerCase().replace(/[-_](.)/g, function(match, group1) {
        return " " + group1.toUpperCase();
    });
}