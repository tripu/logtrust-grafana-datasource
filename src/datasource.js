import _ from "lodash";
import moment from 'moment';
import crypto from './external/crypto-js/core'
import SHA256 from './external/crypto-js/sha256'
import * as crypto2 from './external/crypto-js/index';

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.name = instanceSettings.name;
    if( instanceSettings.jsonData){
      this.url = instanceSettings.jsonData.url;
      //this.token = instanceSettings.jsonData.token;
      this.apikey = instanceSettings.jsonData.apikey;
      this.apisecret = instanceSettings.jsonData.apisecret;
    }
    this.useCredentials = instanceSettings.withCredentials;
    this.$q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.instanceSettings = instanceSettings;
    this.keys = {};
    this.metrics = {};
    this.attributes = {};
  }

  findAttributes(id){
    return this.attributes[id];
  }

/**
* Returns boolean, if the index asked belongs to Keys
*/
  isKey(id, i){
    var ret = false;
    _.each(this.keys[id], (v, k)=>{
      if ( v == i){
        ret =  true;
      }
    });
    return ret;
  }

  /**
  * Returns boolean, if the index asked belongs to metrics
  */
  isMetric(i){
    var ret = false;
    _.each(this.metrics, (v, k)=>{
      if ( k == i){
        ret =  true;
      }
    });
    return ret;
  }

  findMetricIndex (attr){
    var ret = -1;
    _.each(this.metrics, (v, k)=>{
      if ( v.name == attr){
        ret = v.index;
      }
    });
    return ret;
  }
  findFirstMetricIndex (){
    var ret = -1;
    _.each(this.metrics, (v, k)=>{
      ret =  {'idx':v.index, 'v':v};
    });
    return ret;
  }

  restPost(query){

    var body = {};
    body.from = query.from;
    body.to = query.to;
    if (query.queryId.includes("from ")){
      body.query = query.queryId;
    }else{
      body.queryId = query.queryId;
    }
    body.mode = {};
    body.mode.type = "json/compact";
    body.destiny = [];

    var d = new Date();
    var timestamp =  d.getTime();
    var _textohash = this.apikey +  JSON.stringify(body) +  timestamp;

    var hash = crypto.HmacSHA256(_textohash, this.apisecret );
    hash = hash.toString(crypto.enc.Hex);

    var ret = this.backendSrv.datasourceRequest({
      url: this.url + 'query',
      data: body,
      method: 'POST',
      headers: { 'Content-Type' : 'application/json' ,
                'x-logtrust-apikey': this.apikey,
                'x-logtrust-timestamp' : timestamp,
                'x-logtrust-sign': hash
               }
    });
    return ret;
  }

  parseResponseToTableFormat(object){
    var targetResults = [];
    var node = {};
    node.columns = [];
    node.rows = [];
    node.type = 'table';
    _.each(object.m, (item ,i)=> {
             if (item.type == 'timestamp'){
               node.columns.push({text:item.name, type:'time'})
             }
             if (item.type == 'str'){
               node.columns.push({text:item.name, type:'string'})
             }
             if (item.type != 'timestamp' &&
                 item.type != 'str'){
               node.columns.push({text:item.name, type:'number'})
             }
      });

      _.each(object.data, item => {
          node.rows.push(item);
      });
      targetResults.push(node);

      return {data:targetResults};
  }

  buildDataTargets(id, _timestampIndex,data,metricIndex, attrName){
    var _self = this;
    var _targets = {};
    _.each(data, item => {
       var _k = '';
       var _t = 0;
       var _v = item[metricIndex];
      _.each(item, (v,i) => {
        if ( _timestampIndex == i){
          _t = v;
        } else {
          if ( _self.isKey(id,i)){
            _k = (_k == '')?v:(_k + '/' + v+'('+attrName+')');
          }
        }
      });
      if(_targets[_k]){
        _targets[_k].push([_v,_t]);
      }else{
        _targets[_k] = [];
        _targets[_k].push([_v,_t]);
      }
    });
    return _targets;
  }

  pushToTargetResults(targetResults, _targets){
    _.each(_targets, (item, key) =>{
      var _node = {};
      _node.target = key;
      _node.datapoints = item;
      targetResults.push(_node);
    });
  }
  parseResponseToTimeSeries(object, query){
    var _self = this;
    var targetResults = [];
    var _targets = {};
    var _timestampIndex = -1;
    var _keys = {};
    var _metrics = {};

    debugger;
    //var _dataUniqueIdentifier = query.panelId + '-' + query[0].attribute;
    var _dataUniqueIdentifier = query[0].queryId;
    var _attributes = query[0].attribute;
    _self.attributes[_dataUniqueIdentifier] = [];
    _self.keys[_dataUniqueIdentifier] = {};
    _.each(object.m, (item ,i)=> {
             var v = {};
             if (item.type == 'timestamp'){
               _timestampIndex = item.index;
             }
             if (item.type == 'str'){
               _keys[i] = item.index;
               _self.keys[_dataUniqueIdentifier][i] = item.index;
             }
             if (item.type != 'timestamp' &&
                 item.type != 'str'){
               _metrics[i] = {'name':i, 'type': item.type, 'index': item.index};
               _self.metrics[i] = {'name':i, 'type': item.type, 'index': item.index};
              _self.attributes[_dataUniqueIdentifier].push(i);

             }
      });
      if (_attributes){
        _.each(_attributes, attr =>{
          var idx = _self.findMetricIndex(attr);
          _targets = _self.buildDataTargets(_dataUniqueIdentifier,
            _timestampIndex,
            object.d,
            idx,
            attr);
          _self.pushToTargetResults(targetResults, _targets);
        })
      }else{
        var metric = _self.findFirstMetricIndex();
        _targets = _self.buildDataTargets(_dataUniqueIdentifier,
          _timestampIndex,
          object.d,
          metric.idx,
          metric.v.name);
        _self.pushToTargetResults(targetResults, _targets);
      }

    return targetResults;
  }

getStream(query){
  var results = [];
  var ds = this;
  _.each(query, v => {
       results.push(this.restPost(v).then(response => {
         return ds.parseResponseToTimeSeries(response.data.object, query);
    }).catch(err => { console.log(err); })
  );
   })

return results;
}
/**
* Query that returns TimeSeries
*/
  query(options) {
    var ds = this;
    var query = this.buildQueryParameters(options);
    query = query.filter(t => !t.hide);
    if (query.length <= 0) {
      return this.q.when({data: []});
    }
    var panelId = options.panelId;
    query.panelId = panelId;
  return ds.$q.all(
    ds.getStream(query)
  ).then(targetResponses => {
    var flattened = []
    _.each(targetResponses, tr => {
      _.each(tr, item => {
        flattened.push(item)
      })
    })
    return {data: flattened.sort((a, b) => { return +(a.target > b.target) || +(a.target === b.target) - 1 })}
  });
  }

  testDatasource() {
    var q = {};
    q.queryId  = "from system.internal.dual";
    q.from = moment().unix()- 60;
    q.to = moment().unix();
    return this.restPost(q).then(response => {
      return { status: "success", message: "Data source is working", title: "Success" };
 }).catch(err => {
    console.log(err);
    return { status: "error", message: "Data source is not working property", title: "Error" };
   })

  }

  annotationQuery(options) {
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.backendSrv.datasourceRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(options) {
    console.log("llamando a metricFindQuery");
    var target = typeof (options) === "string" ? options : options.target;
    var interpolated = {
        target: this.templateSrv.replace(target, null, 'regex')
    };

    return this.backendSrv.datasourceRequest({
      url: this.url,
      data: interpolated,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(this.mapToTextValue);

  }

  mapToTextValue(result) {

    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i};
      }
      return { text: d, value: d };
    });

  }

  buildQueryParameters(options) {

    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return target.target !== 'select metrics';
    });

    var targets = _.map(options.targets, target => {
      return {
        target: this.templateSrv.replace(target.target),
        refId: target.refId,
        hide: target.hide,
        attribute: target.attributes,
        queryId: target.queryId,
        from: moment(options.range.from, moment.ISO_8601).unix(),
        to:   moment(options.range.to, moment.ISO_8601).unix(),
        type: target.type || 'timeserie'
      };
    });
    return targets;
  }
}
