var BaseCharacters = new Array('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
var CharacterArrays = {'Circumcision': new Array('ⓐ', 'ⓑ', 'ⓒ', 'ⓓ', 'ⓔ', 'ⓕ', 'ⓖ', 'ⓗ', 'ⓘ', 'ⓙ', 'ⓚ', 'ⓛ', 'ⓜ', 'ⓝ', 'ⓞ', 'ⓟ', 'ⓠ', 'ⓡ', 'ⓢ', 'ⓣ', 'ⓤ', 'ⓥ', 'ⓦ', 'ⓧ', 'ⓨ', 'ⓩ', 'Ⓐ', 'Ⓑ', 'Ⓒ', 'Ⓓ', 'Ⓔ', 'Ⓕ', 'Ⓖ', 'Ⓗ', 'Ⓘ', 'Ⓙ', 'Ⓚ', 'Ⓛ', 'Ⓜ', 'Ⓝ', 'Ⓞ', 'Ⓟ', 'Ⓠ', 'Ⓡ', 'Ⓢ', 'Ⓣ', 'Ⓤ', 'Ⓥ', 'Ⓦ', 'Ⓧ', 'Ⓨ', 'Ⓩ'),
'StrikeOut': new Array('λ', 'B', '₡', 'Ð', 'E', '₣', 'G', 'Ҥ', 'ł', 'J', 'Ҟ', 'Ł', 'M', '₦', 'Ø', 'Ҏ', 'Q', 'Ʀ', '$', 'Ŧ', 'U', 'V', '₩', 'X', '¥', 'Z', 'λ', 'B', '₡', 'Ð', 'E', '₣', 'G', 'Ҥ', 'ł', 'J', 'Ҟ', 'Ł', 'M', '₦', 'Ø', 'Ҏ', 'Q', 'Ʀ', '$', 'Ŧ', 'U', 'V', '₩', 'X', '¥', 'Z'),
'MonkeyBalls': new Array('ą', 'ɓ', 'ç', 'd', 'ę', 'ƒ', 'ɠ', 'ђ', 'į', 'ʝ', 'ķ', 'ɭ', 'ɱ', 'ŋ', 'ǫ', 'ƥ', 'ʠ', 'ŗ', 'ş', 'ţ', 'ų', 'v', 'w', 'ҳ', 'ƴ', 'ʐ', 'Ą', 'β', 'Ç', 'D', 'Ę', 'Ƒ', 'Ģ', 'Ң', 'Į', 'J', 'Ķ', 'Ļ', 'Ӎ', 'Ɲ', 'Ǫ', 'Ƥ', 'Q', 'Ŗ', 'Ş', 'Ţ', 'Ų', 'V', 'W', 'Ҳ', 'Ҷ', 'Ȥ'),
'AnalRetentive': new Array('A͏', 'B͏', 'C͏', 'D͏', 'E͏', 'F͏', 'G͏', 'H͏', 'I͏', 'J͏', 'K͏', 'L͏', 'M͏', 'N͏', 'O͏', 'P͏', 'Q͏', 'R͏', 'S͏', 'T͏', 'U͏', 'V͏', 'W͏', 'X͏', 'Y͏', 'Z͏', 'A͏', 'B͏', 'C͏', 'D͏', 'E͏', 'F͏', 'G͏', 'H͏', 'I͏', 'J͏', 'K͏', 'L͏', 'M͏', 'N͏', 'O͏', 'P͏', 'Q͏', 'R͏', 'S͏', 'T͏', 'U͏', 'V͏', 'W͏', 'X͏', 'Y͏', 'Z͏'),
'Squinty': new Array('ᵃ', 'ᵇ', ' ͨ', 'ᵈ', 'ᵉ', 'f', 'ᵍ', 'ʰ', "'", 'ʲ', 'ᵏ', 'ˡ', 'ᵐ', 'ⁿ', 'º', 'ᵖ', 'զ', 'ʳ', 'ˢ', 'ᵗ', 'ᵘ', 'ᵛ', 'ʷ', 'ˣ', 'ʸ', 'ʐ', 'ᴬ', 'ᴮ', '©', 'ᴰ', 'ᴱ', 'f', 'ᴳ', 'ᴴ', 'ˡ', 'ᴶ', 'ᴷ', 'ᴸ', 'ᴹ', 'ᴺ', 'ᴼ', 'ᴾ', 'ᴽ', 'ᴿ', 'ˢ', 'ᵀ', 'ᵁ', 'ᵛ', 'ᵂ', 'ˣ', 'ʸ', '⥸'),
'RustyNail': new Array('ɑ', 'ҍ', 'ϲ', 'ժ', 'ҽ', 'ƒ', 'ց', 'հ', 'ì', 'յ', 'ҟ', 'Ӏ', 'ʍ', 'ղ', 'օ', 'ք', 'զ', 'ɾ', 'ʂ', 'է', 'մ', 'ѵ', 'ա', '×', 'վ', 'Հ', 'ɑ', 'ҍ', 'ϲ', 'ժ', 'ҽ', 'ƒ', 'ց', 'հ', 'ì', 'յ', 'ҟ', 'Ӏ', 'ʍ', 'ղ', 'օ', 'ք', 'զ', 'ɾ', 'ʂ', 'է', 'մ', 'ѵ', 'ա', '×', 'վ', 'Հ'),
'FallenLoki': new Array('A', 'B', 'C', 'Ð', 'E', '₣', 'G', 'ħ', 'I', 'J', 'Ҟ', 'L', 'M', 'N', '㊉', 'P', 'Q', 'R', 'S', 'Ŧ', 'U', 'V', 'W', 'X', 'Ұ', 'Ƶ', 'A', 'B', 'C', 'Ð', 'E', '₣', 'G', 'ħ', 'I', 'J', 'Ҟ', 'L', 'M', 'N', '㊉', 'P', 'Q', 'R', 'S', 'Ŧ', 'U', 'V', 'W', 'X', 'Ұ', 'Ƶ'),
'DisOriented': new Array('丹', '乃', '匚', '刀', 'モ', '下', 'ム', '卄', '工', 'Ｊ', 'Ｋ', 'ㄥ', '爪', 'れ', '口', 'ㄗ', 'Ｑ', '尺', 'ち', '匕', '∪', '∨', '山', 'メ', 'ㄚ', '乙', '丹', '乃', '匚', '刀', 'モ', '下', 'ム', '卄', '工', 'Ｊ', 'Ｋ', 'ㄥ', '爪', 'れ', '口', 'ㄗ', 'Ｑ', '尺', 'ち', '匕', '∪', '∨', '山', 'メ', 'ㄚ', '乙'),
'TrojanHorse': new Array('Δ', 'β', 'C', 'D', 'Σ', 'Ғ', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'Π', 'Ω', 'P', 'Q', 'R', 'S', 'T', 'U', '∇', 'Ш', 'X', 'Ψ', 'Z', 'Δ', 'β', 'C', 'D', 'Σ', 'Ғ', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'Π', 'Ω', 'P', 'Q', 'R', 'S', 'T', 'U', '∇', 'Ш', 'X', 'Ψ', 'Z'),
'FleaPoop': new Array('å', 'b', 'ċ', 'd', 'ë', 'f', 'ğ', 'h', 'ī', 'ĵ', 'k', 'Î', 'm', 'ñ', 'ő', 'p', 'q', 'ř', 'ŝ', 't', 'ů', 'v', 'ẅ', 'x', 'ŷ', 'ž', 'Å', 'B', 'Ċ', 'Ď', 'Ё', 'F', 'Ğ', 'H', 'Ī', 'Ĵ', 'K', 'Ŀ', 'M', 'Ñ', 'Ő', 'P', 'Q', 'Ř', 'Ŝ', 'Ť', 'Ů', 'V', 'Ẅ', 'X', 'Ŷ', 'Ž'),
'OpticalDillusion': new Array('Д', 'Б', 'C', 'D', 'Ξ', 'F', 'G', 'H', 'I', 'J', 'Ҝ', 'L', 'M', 'И', 'Ф', 'P', 'Ǫ', 'Я', 'S', 'Γ', 'Ц', 'V', 'Щ', 'Ж', 'У', 'Z', 'Д', 'Б', 'C', 'D', 'Ξ', 'F', 'G', 'H', 'I', 'J', 'Ҝ', 'L', 'M', 'И', 'Ф', 'P', 'Ǫ', 'Я', 'S', 'Γ', 'Ц', 'V', 'Щ', 'Ж', 'У', 'Z'),
'UpsideDown': new Array('ɐ', 'q', 'ɔ', 'p', 'ǝ', 'ɟ', 'ƃ', 'ɥ', 'ı', 'ɾ', 'ʞ', 'ℸ', 'ɯ', 'u', 'o', 'd', 'b', 'ɹ', 's', 'ʇ', 'n', 'ʌ', 'ʍ', 'x', 'ʎ', 'z', '∀', 'q', 'ɔ', '◖', 'Ǝ', 'Ⅎ', 'ƃ', 'H', 'I', 'ſ', '⋊', 'ℸ', 'W', 'ᴎ', 'O', 'Ԁ', 'Ό', 'ᴚ', 'S', '⊥', '∩', 'ᴧ', 'M', 'X', 'ʎ', 'Z'),
'Falfabet': new Array('ḁ', 'ḃ', 'ḉ', 'ḋ', 'ḕ', 'ḟ', 'ḡ', 'ḧ', 'ḭ', 'j', 'ḱ', 'ḷ', 'ḿ', 'ṅ', 'ṍ', 'ṕ', 'q', 'ṙ', 'ṥ', 'ṫ', 'ṳ', 'ṽ', 'ẁ', 'ẍ', 'ẏ', 'ẑ', 'Ḁ', 'Ḃ', 'Ḉ', 'Ḋ', 'Ḕ', 'Ḟ', 'Ḡ', 'Ḧ', 'Ḭ', 'J', 'Ḱ', 'Ḷ', 'Ḿ', 'Ṅ', 'Ṍ', 'Ṕ', 'Q', 'Ṙ', 'Ṥ', 'Ṫ', 'Ṳ', 'Ṽ', 'Ẁ', 'Ẍ', 'Ẏ', 'Ẑ'),
'CapSlap': new Array(),
'Slowercase': new Array(),
'InterCapped': new Array(),
'StartCap': new Array(),
'LackOfSpace': new Array(),
'L337': new Array('4', 'b', 'c', 'd', '3', 'f', 'g', 'h', '1', 'j', 'l<', 'l_', '(\\/)', 'n', '0', 'p', 'q', 'r', '5', '7', '|_|', 'v', '\/\/', '}{', 'y', 'z', '/-\\', '13', 'C', '[)', '€', 'F', 'G', ']-[', 1, 'J', '|<', '|_', 'l\/l', ']\\[', '0', 'P', 'Q', 'l2', 5, 7, '|_|', '\/', '\/\/', '}{', '`/', 'Z'),
'rorriM': new Array(),
'MD5': new Array(),
'SHA1': new Array(),
'Base64': new Array(),
'rot13': new Array(),
'Binary': new Array(),
'Hex': new Array(),
'Dec': new Array()
};
var BaseNumArray = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
var NumberArrays = {
    'Circumcision': new Array('⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨'),
    'UpsideDown': new Array('0', '1', '2', 'Ɛ', 'ᔭ', '5', '9', 'Ɫ', '8', '6'),
    'Squinty': new Array('₀', '₁', '₂', '₃', '₄', '₅', '₆', '₈', '₉')
};
var BasePuncArray = new Array('!', '?', '.');
var PuncArrays = {
    'UpsideDown': new Array('¡', '¿', '˙')
};

function transmogrify(input, method) {
    var output;
    switch (method) {
    case 'CapSlap':
        output = input.toUpperCase();
        break;
    case 'Slowercase':
        output = input.toLowerCase();
        break;
    case 'InterCapped':
        output = ucwords(input.toLowerCase());
        break;
    case 'StartCap':
        output = input.charAt(0).toUpperCase()
                + input.substr(1).toLowerCase();
        break;
    case 'LackOfSpace':
        output = input.replace(/ /g, '');
        break;
    case 'rorriM':
        output = input.split('').reverse().join('');
        break;
    case 'MD5':
        output = md5(input);
        break;
    case 'SHA1':
        output = sha1(input);
        break;
    case 'Base64':
        output = base64_encode(input);
        break;
    case 'rot13':
        output = str_rot13(input);
        break;
    case 'Binary':
        var outputarray = new Array();
        $.each(input, function(i, c) {
            outputarray[i] = input.charCodeAt(i).toString(2);
            /* Pad with leading zeros if less than 8 in length */
            var len = outputarray[i].length;
            while (len < 8) {
                outputarray[i] = '0' + outputarray[i];
                len++;
            }
        });
        output = outputarray.join(' ');
        break;
    case 'Hexadecimal':
        var outputarray = new Array();
        $.each(input, function(i, c) {
            outputarray[i] = input.charCodeAt(i).toString(16);
        });
        output = outputarray.join(' ');
        break;
    case 'Decimal':
        var outputarray = new Array();
        $.each(input, function(i, c) {
            outputarray[i] = input.charCodeAt(i);
        });
        output = outputarray.join(' ');
        break;
    default:
        var outputarray = new Array();
        $.each(input, function(i, c) {
            try {
                if (method == 'UpsideDown') {
                    if (c == ')') {
                        c = '(';
                    } else if (c == '(') {
                        c = ')';
                    }
                }
                var index = $.inArray(c, BaseCharacters);
                if (index > -1) {
                    outputarray[i] = CharacterArrays[method][index];
                } else {
                    index = $.inArray(c, BaseNumArray);
                    if (index > -1) {
                        outputarray[i] = NumberArrays[method][index];
                    } else {
                        index = $.inArray(c, BasePuncArray);
                        if (index > -1) {
                            outputarray[i] = PuncArrays[method][index];
                        } else {
                            outputarray[i] = c;
                        }
                    }
                }
            } catch (e) {
                outputarray[i] = c;
            }
        });
        if (method == 'UpsideDown') {
            output = outputarray.reverse().join("");
        } else {
            output = outputarray.join("");
        }
        break;
    }
    return output;
}
