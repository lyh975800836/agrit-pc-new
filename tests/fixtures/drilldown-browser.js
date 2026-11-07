// Isolated browser fixture. Inject only into a local development page; no backend writes.
(() => {
  if (!['localhost', '127.0.0.1'].includes(location.hostname)) throw new Error('Fixture requires a local development page');
  localStorage.setItem('auth_token', 'local-test-session');
  localStorage.setItem('user_info', JSON.stringify({ username: '本地测试' }));
  window.__calls = []; window.__errors = []; window.__alerts = [];
  window.__fixture = { tileStatus: 'processing', forbidden: false, revision: 0, delay: 0 };
  window.alert = message => window.__alerts.push(message);
  window.addEventListener('error', event => window.__errors.push(event.message));
  const polygon = JSON.stringify({type:'Polygon',coordinates:[{longitude:106.001,latitude:23.999},{longitude:106.003,latitude:23.999},{longitude:106.003,latitude:23.997},{longitude:106.001,latitude:23.999}]});
  const plots = {
    '900':{id:'900',name:'模拟主地块',node_type:'',ext_attrs:{drilldown:true},area:100},
    '901':{id:'901',name:'区域01',node_type:'region',parent_plot_id:'900',root_plot_id:'900',area:60},
    '902':{id:'902',name:'农户甲',farmer_name:'农户甲',node_type:'parcel',parent_plot_id:'901',root_plot_id:'900',area:10},
    '903':{id:'903',name:'农户乙',node_type:'parcel',parent_plot_id:'901',root_plot_id:'900',area:20},
    '800':{id:'800',name:'普通地块',node_type:'',area:30},
    '801':{id:'801',name:'模拟工厂',property_category:'factory',area:30},
    '802':{id:'802',name:'模拟仓库',property_category:'warehouse',area:30}
  };
  Object.values(plots).forEach(plot=>Object.assign(plot,{location_info:polygon,property_category:plot.property_category||'forest',property_type:'bajiao_base',config_data:{}}));
  const originalFetch=window.fetch;
  const ok=data=>new Response(JSON.stringify({code:0,data}),{headers:{'Content-Type':'application/json'}});
  window.fetch=async (url,options={})=>{
    if(!String(url).includes('/api/')) return originalFetch(url,options);
    const endpoint=String(url).split('?')[0], body=options.body?JSON.parse(options.body):{};
    window.__calls.push({endpoint,body});
    if(window.__fixture.forbidden && endpoint.endsWith('/plot-analysis/summary')) return new Response(JSON.stringify({code:403,message:'无权查看该地块'}));
    let data={};
    const tile={status:window.__fixture.tileStatus,layer_name:'fixture_random_'+(++window.__fixture.revision),sub_plot_id:body.plot_id==='900'?'0':body.plot_id==='902'?'902':'901',max_zoom_level:4,max_tile_x:0,max_tile_y:0,tile_size:512,min_lon:106,max_lat:24,pixel_per_lon_degree:100000,pixel_per_lat_degree:100000,tile_format:'png',tile_path_prefix:'test'};
    if(endpoint.endsWith('/plot/detail')) data=plots[body.id];
    else if(endpoint.endsWith('/plot/list')) data={list:[plots['902']],total:1,total_area:10};
    else if(endpoint.endsWith('/plot/sub-plots')) data=body.parent_plot_id==='900'?[plots['901'],plots['902'],plots['903']]:[];
    else if(endpoint.endsWith('/plot-analysis/timeline')) data={latest_analysis_id:'14',years:[2026],nodes:[{analysis_id:'13',detected_at:'2026-09-01',has_tile:false,has_pest:false},{analysis_id:'14',detected_at:'2026-10-01',has_tile:false,has_pest:false}]};
    else if(endpoint.endsWith('/plot-analysis/summary')) {data={analysis_tile:window.__fixture.tileStatus===null?null:tile,total_trees:body.analysis_id==='13'?5:10,has_pest:false,has_yield:false,ai_summary:'当前范围的测试分析',detected_at:'2026-10-01'}; if(window.__fixture.delay)await new Promise(resolve=>setTimeout(resolve,window.__fixture.delay));}
    else if(endpoint.endsWith('/plot-analysis/tiles/trees')) data={tiles:[{tile_x:0,tile_y:0,trees:[{tree_id:'R01-000001',tile_x:0,tile_y:0,pixel_x:200,pixel_y:200,longitude:106.002,latitude:23.998,tree_area:5}]}],source_tile_size:512};
    else if(endpoint.endsWith('/plot-analysis/tree/detail')) data={tree_id:body.tree_id,farmer_name:'农户甲',region_name:'区域01',parcel_name:'农户甲'};
    else if(endpoint.endsWith('/plot-analysis/sub-plot-stats')) data={has_pest:false,has_yield:false,summary:{region_count:1,parcel_count:2,farmer_count:2,tree_count:30},regions:[{plot_id:'901',name:'区域01',tree_count:30}],parcels:[{plot_id:'902',name:'农户甲',tree_count:10}],farmers:[{farmer_name:'农户甲',parcel_ids:['902'],tree_count:10}]};
    else if(endpoint.endsWith('/plot-tiles/info')) data={...tile,status:'completed',layer_name:'ordinary_base'};
    else if(endpoint.endsWith('/plot/health-detail')) data={health_score:85,health_delta:2,health_level:'良好',trend:[{date:'10/01',score:85}]};
    else if(endpoint.endsWith('/plot/key-metrics')) data={metrics:[{key:'ventilation',label:'通风率',value:'78%'}]};
    else if(endpoint.endsWith('/plot/soil-data')) data={metrics:[]};
    else if(endpoint.endsWith('/plot/certifications')) data={certs:[]};
    else if(endpoint.endsWith('/plot-analysis/export-pdf')) data={pdf_url:'https://example.com/fixture-report.pdf'};
    else if(endpoint.endsWith('/plot-analysis/create-farming')) data={task_id:'mock-task-1'};
    else if(endpoint.includes('/markers/plot/')) data=[];
    else data={list:[]};
    return ok(data);
  };
})();
