var TT = (function (TT) {

    TT.Util = {
        getMetroDataFromString: function(string) {
            var trans = string.match(/^(\d+)\s+([a-zåäö\.]+(?:\s[a-zåäö\.]+)*)(?:\s\*\s)?(?:\s+(\d+\s[a-z]+)[\.\s]?)?$/i);
            if (trans === null) {
                console.log(string);
            }
            return trans;
        }
    };

    return TT;

})(TT || {});