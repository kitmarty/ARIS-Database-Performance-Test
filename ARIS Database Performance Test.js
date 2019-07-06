/*
@author
Nikita Martyanov 
mailto: nikita.martyanov@gmail.com
https://kitmarty.github.io
***************************************************
ARIS Database Performance Test

Context: Group
Output Formats: TXT
*/

//System Object with common variables
var System = {
    loc: Context.getSelectedLanguage(),
    filter: ArisData.ActiveFilter(),
    db: ArisData.getActiveDatabase(),
    servername: ArisData.getActiveDatabase().ServerName()
}

//Time object
var TimeCalculator = {
    now: function(){
        return new Date()
    },
    diff: function(date2, date1) {
        return new Date(date2.getTime() - date1.getTime())
    },
    print: function(date) {
        function getLeadingZero(number, length){
            if (length==null)
                length = 2
            var number_with_lead = String(number)
            if (number_with_lead.length < length){
                while (number_with_lead.length < length)
                    number_with_lead = "0" + number_with_lead
            }
            return number_with_lead
        }
        return getLeadingZero(date.getUTCHours()) + ":" + getLeadingZero(date.getUTCMinutes()) + ":" +
               getLeadingZero(date.getUTCSeconds()) + "." + getLeadingZero(date.getUTCMilliseconds(), 3)
    }
}

//Object to create ARIS objects for tests
var ObjectCreator = {
    root: System.db.RootGroup(),
    MODELS: 0,
    GROUPS: 0,
    DEFINITIONS: 0,
    OCCS_DEFS: 0,
    createModel: function(){
        this.root.CreateModel(Constants.MT_EEPC, "MODEL_"+String(++this.MODELS), System.loc)
    },
    createGroup: function(){
        this.root.CreateChildGroup("GROUP_"+String(++this.GROUPS), System.loc)
    },
    createDefinition: function(){
        this.root.CreateObjDef(Constants.OT_FUNC, "DEFINITION_"+String(++this.DEFINITIONS), System.loc)
    },
    createOccurrence: function(){
        var x = 0;
        var y = 0;
        var step = 250;
        var model = this.root.ModelList()[0]
        var def = this.root.ObjDefList()[0]
        model.CreateObjOcc(Constants.ST_FUNC, def, x, y)
        x += step;
        y += step;
    },
    clearRoot: function(){
        var items = this.root.ModelList().concat(this.root.ObjDefList()).concat(this.root.Childs())
        var i = 0
        while (i<items.length){
            this.root.Delete(items[i])
            i++
        }
    }
}

//Report object
var Report = {
    oOutput: null,
    init: function(){
        oOutput = Context.createOutputObject()
    },
    write: function(){
        oOutput.WriteReport()
    },
    println: function(text){
        oOutput.OutputTxt(text+"\n")
    }
}

//Object for repeating tests with different parameters
function Tester(func){
    const VALUE = 1000;
    var count = 0
    
    var startTime = TimeCalculator.now()
    while (count < VALUE){
        ObjectCreator[func]()
        count++
    }
    var stopTime = TimeCalculator.now()
    Report.println("start:\t" + TimeCalculator.print(startTime))
    Report.println("stop:\t" + TimeCalculator.print(stopTime))
    Report.println("diff:\t" + TimeCalculator.print(TimeCalculator.diff(stopTime, startTime)))
    Report.println("========\n")
}

function testOnDemand(){
    Report.println("Test Save On Demand")
    Report.println("")
    System.db.clearCaches()
    ArisData.Save(Constants.SAVE_ONDEMAND)
    
    var startTime = TimeCalculator.now()
    
    Report.println("create 1000 subgroups in the root group")
    Tester("createGroup")
    
    Report.println("create 1000 models in the root group")
    Tester("createModel")
    
    Report.println("create 1000 definitions in the root group")
    Tester("createDefinition")
    ArisData.Save(Constants.SAVE_NOW)
    
    Report.println("create 1000 occurreneces on a random model")
    Tester("createOccurrence")
    ArisData.Save(Constants.SAVE_NOW)
    
    Report.println("clear root group (delete all items)")
    Tester("clearRoot")
    ArisData.Save(Constants.SAVE_NOW)
    
    var stopTime = TimeCalculator.now()
    Report.println("Test 'Save On Demand' total time")
    Report.println("start:\t" + TimeCalculator.print(startTime))
    Report.println("stop:\t" + TimeCalculator.print(stopTime))
    Report.println("diff:\t" + TimeCalculator.print(TimeCalculator.diff(stopTime, startTime)))
    Report.println("========\n")
    
    System.db.clearCaches()
    ArisData.Save(Constants.SAVE_AUTO)
}

function testAuto(){
    Report.println("Test Save Auto")
    Report.println("")
    System.db.clearCaches()
    ArisData.Save(Constants.SAVE_AUTO)
    
    var startTime = TimeCalculator.now()
    
    Report.println("create 1000 subgroups in the root group")
    Tester("createGroup")
    
    Report.println("create 1000 models in the root group")
    Tester("createModel")
    
    Report.println("create 1000 definitions in the root group")
    Tester("createDefinition")
    
    Report.println("create 1000 occurreneces on a random model")
    Tester("createOccurrence")

    Report.println("clear root group (delete all items)")
    Tester("clearRoot")
    
    var stopTime = TimeCalculator.now()
    Report.println("Test 'Save Auto' total time")
    Report.println("start:\t" + TimeCalculator.print(startTime))
    Report.println("stop:\t" + TimeCalculator.print(stopTime))
    Report.println("diff:\t" + TimeCalculator.print(TimeCalculator.diff(stopTime, startTime)))
    Report.println("========\n")
    
    System.db.clearCaches()
}

function testImmediately(){
    Report.println("Test Save Immediately")
    Report.println("")
    System.db.clearCaches()
    ArisData.Save(Constants.SAVE_IMMEDIATELY)

    var startTime = TimeCalculator.now()
    
    Report.println("create 1000 subgroups in the root group")
    Tester("createGroup")
    
    Report.println("create 1000 models in the root group")
    Tester("createModel")
    
    Report.println("create 1000 definitions in the root group")
    Tester("createDefinition")
    
    Report.println("create 1000 occurreneces on a random model")
    Tester("createOccurrence")

    Report.println("clear root group (delete all items)")
    Tester("clearRoot")

    var stopTime = TimeCalculator.now()
    Report.println("Test 'Save Immediately' total time")
    Report.println("start:\t" + TimeCalculator.print(startTime))
    Report.println("stop:\t" + TimeCalculator.print(stopTime))
    Report.println("diff:\t" + TimeCalculator.print(TimeCalculator.diff(stopTime, startTime)))
    Report.println("========\n")

    System.db.clearCaches()
    ArisData.Save(Constants.SAVE_AUTO)
}

function main(){
    Report.init()
    
    Report.println("ARIS Database Performance Test")
    Report.println("LOCAL Server; Version 98.8.0.1155162")
    Report.println("")
    
    //comment out modes you don't want to test
    testAuto()
    testOnDemand()
    testImmediately()

    Report.write()
}

main()