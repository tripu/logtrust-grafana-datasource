import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv, templateSrv, $q)  {
    super($scope, $injector);
    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    this.templateSrv = templateSrv
    this.$q = $q
    this.attributes = []
    this.availableAttributes = {}
    this.attributeSegment = this.uiSegmentSrv.newPlusButton()

  //  this.target.target = this.target.target || 'select queryid';
    this.target.target = 'select Devo';
    this.target.type = this.target.type || 'timeserie';
  }

  getOptions() {
    return this.datasource.metricFindQuery(this.target)
      .then(this.uiSegmentSrv.transformToSegments(false));
      // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  // add an attribute to the query
  attributeAction () {
    // if value is not empty, add new attribute segment
    if (!this.isValueEmpty(this.attributeSegment.value)) {
      this.attributes.push(this.uiSegmentSrv.newSegment({value: this.attributeSegment.value, expandable: true}))
      this.targetChanged()
    }

    // reset the + button
    var plusButton = this.uiSegmentSrv.newPlusButton()
    this.attributeSegment.value = plusButton.value
    this.attributeSegment.html = plusButton.html
    this.panelCtrl.refresh()
  }

  // change an attribute
  attributeValueChanged (segment, index) {
    this.attributes[index].value = segment.value
    if (this.isValueEmpty(segment.value)) {
      this.attributes.splice(index, 1)
    }
    this.targetChanged()
    this.panelCtrl.refresh()
  }


  // get the list of attributes for the user interface
  getAttributeSegments () {
    var ctrl = this
    var segments = []
    var _attrs = ctrl.datasource.findAttributes(ctrl.target.queryId);

    _.each(_attrs, k =>{
      ctrl.availableAttributes[k] = k;
    });

    _.forOwn(ctrl.availableAttributes, (val, key) => {
      segments.push(ctrl.uiSegmentSrv.newSegment({value: key, expandable: true}))
    })
    segments.unshift(ctrl.uiSegmentSrv.newSegment('-REMOVE-'))

    return this.$q.when(segments)
  }

  /**
   * Gets the currently selected child attributes.
   *
   * @returns - String of selected attributes.
   *
   * @memberOf
   */
  getAttributes () {
    var arr = this.attributes.slice(0, this.attributes.length)
    return _.reduce(arr, function (result, segment) {
      if (!segment.value.startsWith('Select AF')) {
        return result ? (result + ';' + segment.value) : segment.value
      }
      return result
    }, '')
  }

  // is selected segment empty
  isValueEmpty (value) {
    return value === undefined || value === null || value === '' || value === '-REMOVE-'
  }

  targetChanged () {
    if (this.error) { return }

    var ctrl = this
    var oldTarget = this.target.target
    var attributes = this.getAttributes()
  //  var target = element + ';' + attributes
  //  this.target.target = target // _.reduce(this.functions, this.wrapFunction, target)
  //  this.target.elementPath = element
    this.target.attributes = attributes.split(';')

  }


}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
