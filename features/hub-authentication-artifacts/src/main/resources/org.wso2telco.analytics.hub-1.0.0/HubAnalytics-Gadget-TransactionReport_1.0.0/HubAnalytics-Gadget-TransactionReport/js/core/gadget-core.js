/*
* Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
$(function () {
    var gadgetLocation;
    var conf;
    var schema;
    var pref = new gadgets.Prefs();
    
    var refreshInterval;
    var providerData;
    
    var CHART_CONF = 'chart-conf';
    var PROVIDER_CONF = 'provider-conf';
    
    var REFRESH_INTERVAL = 'refreshInterval';
    
var init = function () {
    $.ajax({
        url: gadgetLocation + '/conf.json',
        method: "GET",
        contentType: "application/json",
        async: false,
        success: function (data) {
            conf = JSON.parse(data);


            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                method: "POST",
                data: JSON.stringify(conf),
                contentType: "application/json",
                async: false,
                success: function (data) {
                    schema = data;
                }
            });
           }
       });
};

var getProviderData = function (){

    $.ajax({
        url: gadgetLocation + '/gadget-controller.jag?action=getData',
        method: "POST",
        data: JSON.stringify(conf),
        contentType: "application/json",
        async: false,
        success: function (data) {
        providerData = data;
        }
    });
 return providerData;
};


var drawGadget = function (){
    
    draw('#canvas', conf[CHART_CONF], schema, providerData);
    setInterval(function() {
        draw('#canvas', conf[CHART_CONF], schema, getProviderData());
    },pref.getInt(REFRESH_INTERVAL));
    
};


  $("#button-generate").click(function() {
            $("#canvas").html("");
            getGadgetLocation(function (gadget_Location) {
                    gadgetLocation = gadget_Location;
                    conf.operator =  $("#button-operator").val();
                    conf.serviceProvider = $("#button-sp").val();
                    conf.api = $("#button-api").val();
                    conf.applicationName = $("#button-app").val();
                    conf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
                    conf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();

                    $.ajax({
                        url: gadgetLocation + '/gadget-controller.jag?action=generate',
                        method: "POST",
                        data: JSON.stringify(conf),
                        contentType: "application/json",
                        async: false,
                        success: function (data) {
                                $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> ' 
                                    +"Please refresh the transaction report list"
                                    + '</div>' + $("#output").html());
                                $('#success-message').fadeIn().delay(2000).fadeOut();
                            }
                    });


            });
    });


    $("#button-list").click(function() {
            $("#output").html("");
            getGadgetLocation(function (gadget_Location) {
                    gadgetLocation = gadget_Location;
                    $.ajax({
                        url: gadgetLocation + '/gadget-controller.jag?action=available', 
                        method: "POST",
                        data: JSON.stringify(conf),
                        contentType: "application/json",
                        async: false,
                        success: function (data) {
                            $("#output").html("<ul class = 'list-group'>")
                            for (var i = 0; i < data.length; i++) {
                                $("#output").html(  $("#output").html()+"<li class = 'list-group-item'>"
                                    +" <span class='btn-label'>" + data[i].name + "</span>"
                                    +" <div class='btn-toolbar'>"
                                    +"<a class='btn btn-primary btn-xs' onclick='downloadFile("+data[i].index+")'>Download</a>"
                                    +"<a class='btn btn-default btn-xs' onclick='removeFile("+data[i].index+")'>Remove</a>"
                                    +"</div>"
                                    +"</li>");
                            }
                            $("#output").html( $("#output").html() + "<ul/>")
                                
                            }
                    });


            });
    });



 getGadgetLocation(function (gadget_Location) {
                    gadgetLocation = gadget_Location;
                    init();

                    conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_SERVICE_PROVIDER_SUMMARY";
                    conf["provider-conf"]["provider-name"] = "sp";
                     $.ajax({
                            url: gadgetLocation + '/gadget-controller.jag?action=getData',
                            method: "POST",
                            data: JSON.stringify(conf),
                            contentType: "application/json",
                            async: false,
                            success: function (data) {
                                    var items = "";

                                    for ( var i =0 ; i < data.length; i++) {
                                        items += '<li><a href="#">' + data[i]["serviceProvider"] +'</a></li>'
                                    }
                                    $("#dropdown-sp").html( $("#dropdown-sp").html() + items);
                                     $("#button-sp").val("All"); 


                                    $("#dropdown-sp li a").click(function(){
                                        $("#button-sp").text($(this).text());
                                        $("#button-sp").append('<span class="caret"></span>');
                                        $("#button-sp").val($(this).text());


                                        conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
                                        conf["provider-conf"]["provider-name"] = "app";

                                        conf.serviceProvider = $("#button-sp").val();

                                         $.ajax({
                                                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                                                method: "POST",
                                                data: JSON.stringify(conf),
                                                contentType: "application/json",
                                                async: false,
                                                success: function (data) {
                                                        var appItems = '<li><a href="#">All</a></li>';
                                                        var apiItems = '<li><a href="#">All</a></li>';
                                                        var apps = [];

                                                        for ( var i =0 ; i < data.length; i++) {
                                                            apps.push(data[i]["applicationName"]);
                                                            apiItems += '<li><a href="#">' + data[i]["api"] +'</a></li>'
                                                        }

                                                        apps = Array.from(new Set(apps));
                                                        for ( var i =0 ; i < apps.length; i++) {
                                                              appItems += '<li><a href="#">' + apps[i] +'</a></li>'
                                                        }

                                                        $("#dropdown-app").html(appItems);
                                                        $("#button-app").val("All"); 

                                                        $("#dropdown-app li a").click(function(){
                                                            $("#button-app").text($(this).text());
                                                            $("#button-app").append('<span class="caret"></span>');
                                                            $("#button-app").val($(this).text());
                                                          }); 

                                                        $("#dropdown-api").html(apiItems);
                                                        $("#button-api").val("All"); 

                                                        $("#dropdown-api li a").click(function(){
                                                            $("#button-api").text($(this).text());
                                                            $("#button-api").append('<span class="caret"></span>');
                                                            $("#button-api").val($(this).text());
                                                          }); 
                                                    }
                                            });



                                      }); 


                                    }
                        });

                    conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_OPERATOR_SUMMARY";
                    conf["provider-conf"]["provider-name"] = "operator";
                     $.ajax({
                            url: gadgetLocation + '/gadget-controller.jag?action=getData',
                            method: "POST",
                            data: JSON.stringify(conf),
                            contentType: "application/json",
                            async: false,
                            success: function (data) {
                                    var items = "";

                                    for ( var i =0 ; i < data.length; i++) {
                                        items += '<li><a href="#">' + data[i]["operatorId"] +'</a></li>'
                                    }
                                    $("#dropdown-operator").html( $("#dropdown-operator").html() + items);
                                     $("#button-operator").val("All"); 


                                    $("#dropdown-operator li a").click(function(){
                                        $("#button-operator").text($(this).text());
                                        $("#button-operator").append('<span class="caret"></span>');
                                        $("#button-operator").val($(this).text());
                                      }); 
                                    }
                        });


                        $("#button-app").val("All");
                         $("#button-api").val("All"); 
            });




});


function removeFile(index) {
 getGadgetLocation(function (gadget_Location) {
    gadgetLocation = gadget_Location;
    $.ajax({
        url: gadgetLocation + '/gadget-controller.jag?action=remove&index='+index,
        method: "POST",
        contentType: "application/json",
        async: false,
        success: function (data) {
                   $("#button-list").click();
               }
   });  
   });
}


function downloadFile(index) {
 getGadgetLocation(function (gadget_Location) {
    gadgetLocation = gadget_Location;
    
    location.href =  gadgetLocation + '/gadget-controller.jag?action=get&index='+index;

   });
}



