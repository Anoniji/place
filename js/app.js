// init
allow_guest(true);

// init vars
var _URL=window.URL||window.webkitURL;
var wss_url='wss://wss-place.anoniji.dev';
var discord_auth_url='https://discord.com/api/oauth2/authorize?client_id=1022156371262722189&redirect_uri=https%3A%2F%2Fplace.anoniji.dev%2Fauth&response_type=code&scope=identify%20email';
var wsocket = new WebSocket(wss_url);
var px_x=100,px_y=100,max_size=500,delta_pxs=300,writing,file,img,langpak,eta_draggable=!0;

// init localStorage
var lightmode=localStorage.getItem('lightmode'),pseudo=localStorage.getItem('username'),user=localStorage.getItem('id');

// lang set
'fr'!=(language=navigator.language.split('-')[0])&&(language='en')
$.ajax({
    url: '/langs/' + language + '.json',
    async: false,
    dataType: 'json',
    success: function(response) {
        langpak = response;
        if(language != 'en') {
            $('#new_session').attr('placeholder', langpak['key_02']);
            $('#place_help').attr('title', langpak['key_13']);
        }
        $('#dark_mode').attr('title', langpak['key_36']);
        $.each(langpak, function(index, value){
            $('.' + index).html(value);
        });
    }
});

// ws init
wsocket.onclose=function(n){$('section').fadeOut(300),SnackBar({fixed:!0,position:'bc',message:langpak.key_28,status:'warning'}),setTimeout(function(){location.reload()},5e3)};

// light mode
lightmode?($("#dark_mode").html("<img src='./img/moon_icon.png'>"),$("body").animate({"background-color":"#e3e3e3"},300),$("#home .title, #cr").animate({color:"rgb(0, 0, 0, .8)"},300)):$("#cr").animate({color:"rgb(254, 254, 254, .8)"},300);

// function minified ---------------------------------------------------------------------------------------------------------
function allow_guest(e){e||$("#go_gest").remove()}
function dark_mode(){localStorage.getItem("lightmode")?($("#dark_mode").html("<img src='./img/sun_icon.png'>"),$("body").animate({"background-color":"#1c2024"},300),$("#home .title, #cr").animate({color:"rgb(254, 254, 254, .8)"},300),localStorage.removeItem("lightmode")):($("#dark_mode").html("<img src='./img/moon_icon.png'>"),$("body").animate({"background-color":"#e3e3e3"},300),$("#home .title, #cr").animate({color:"rgb(0, 0, 0, .8)"},300),localStorage.setItem("lightmode","enable"))}
function music_player(){const i=document.querySelector("audio");i.paused?(i.volume=.1,i.play(),$("#music_player").html("<img src='./img/stop_icon.png'>").animate({opacity:.8},150)):(i.pause(),$("#music_player").html("<img src='./img/play_icon.png'>").animate({opacity:.1},150))}
function getRandomInt(n){return Math.floor(Math.random()*n)}
function containsOnlyNumbers(n){return/^\d+$/.test(n)}
function change_size(i,e){size=$("#"+i).val(),containsOnlyNumbers(size)?(size=parseInt(size,10)+10,size>max_size&&(size=max_size),$("#"+i).val(size.toString())):$("#"+i).val(e.toString())}
function check_size(i,e){size=$("#"+i).val(),containsOnlyNumbers(size)?(size=parseInt(size,10),size>max_size&&(size=max_size),$("#"+i).val(size.toString())):$("#"+i).val(e.toString())}
function change_mode(){new_mode=$("#place_select_mode").val(),wsocket.send("mode;"+user+";"+session+";"+new_mode)}
function helper(e){writing?$(".key_12").show():$(".key_12").hide(),$("#helper").fadeToggle(300)}
function getLogout(){localStorage.removeItem('id'),localStorage.removeItem('username'),localStorage.removeItem('email'),location.href='/'}
function getAuthDiscord(){location.href=discord_auth_url}
function getAuthGuest(){var e='guest_'+getRandomInt(5e5).toString();localStorage.setItem('id',e),localStorage.setItem('username',e),localStorage.setItem('email',e+'@anoniji.dev'),location.href='/'}
function getPlace(){window.location.hash='#'+$('#new_session').val(),location.reload()}
function goMainSite(){location.href='https://github.com/Anoniji/place'}
function new_size(){const e=$('#new_size_x').val(),s=$('#new_size_y').val();wsocket.send('size;'+user+';'+session+';'+e.toString()+';'+s.toString())}
function razPos(){position='70;68',localStorage.setItem('position',position),$('#place').animate({left:'70px',top:'68px'},300)}
function write_mode(e){wsocket.send('writing;'+user+';'+session+';'+e)}
function clear_place(){1==confirm(langpak.key_35)&&wsocket.send('clear;'+user+';'+session)}
function return_home(){window.location.hash='',location.reload()}
function toggleDraggablePlace(){eta_draggable?($('#stopMove').animate({opacity:.1},150),$('#place').draggable('disable'),eta_draggable=!1):($('#stopMove').animate({opacity:.8},150),$('#place').draggable('enable'),eta_draggable=!0)}
function resetOverlay(){$('#overlay').css({width:0,height:0,top:'15px',left:'15px'}),$('#overlay_checked').hide(),$('#overlay_add').html('<img src=\'./img/gallery_icon.png\'>').attr('onclick','openDialog();').css({opacity:''}),$('#overlay img').removeAttr('src'),$('#fileid').val(''),$('#place').fadeIn(300),$('#overlay').draggable('enable').resizable('enable')}
function overlay_checked(){$('#overlay_checked').hide(),$('#place').fadeIn(300),$('#overlay').draggable('disable').resizable('disable'),$('#overlay img').css('cursor','default')}
function waitForElm(e){return new Promise((t=>{if(document.querySelector(e))return t(document.querySelector(e));const r=new MutationObserver((o=>{document.querySelector(e)&&(t(document.querySelector(e)),r.disconnect())}));r.observe(document.body,{childList:!0,subtree:!0})}))}
function place_select(e){$("#new_session").val(e)}
function wip_show(){SnackBar({fixed:!0,position:"tl",message:langpak.key_01,status:"info",timeout:0})}
function openDialog(){document.getElementById('fileid').click()}
$("#fileid").change((function(e){(file=this.files[0])&&(img=new Image,img.onload=function(){$("#overlay").css({top:"68px",left:"70px",width:parseInt(this.width,10),height:parseInt(this.height,10)})},img.onerror=function(){SnackBar({fixed:!0,position:"bc",message:langpak.key_14+type,status:"danger"})},img.src=_URL.createObjectURL(file),$("#overlay_checked").show(),$("#overlay img").attr("src",img.src).css("cursor","all-scroll"),$("#overlay_add").html("<img src='./img/recyclebin_icon.png'>").attr("onclick","resetOverlay();").css({opacity:.9}),$("#place").fadeOut(300))}));
$('#overlay').draggable().resizable({aspectRatio:!0});
// function minified ---------------------------------------------------------------------------------------------------------

user?user=user.toString():$("#home .title").delay(500).animate({opacity:1},300);
if(window.location.hash) {
    if(!user) {
        localStorage.setItem('redirect', window.location.hash);
        window.location.hash = '';
        location.reload();
    }
    $('#home').remove();
    $(document).keypress((function(o){'114'==(o.keyCode?o.keyCode:o.which)&&(window.location.hash='',location.reload())}));

    // init
    var c=$('#place'),ctx=c[0].getContext('2d');
    var place_current_size=[0,0],initColor='#2196f3',currentColor=initColor;
    saveColor=localStorage.getItem('color'),saveColor&&(initColor=saveColor);
    var session = window.location.hash.substring(1);
    var dragposition,position,zoom,mouseX,mouseY,clicked=!0,delayZoom=50,currentZoom=5,maxZoom=24,minZoom=2;

    wsocket.onmessage=e=>{
        ws_data=e.data;
        if(ws_data == 'wip') {
            wip_show();
        } else if(ws_data.startsWith('place_error')) {
            error=ws_data.split(";")[1];
            SnackBar({fixed:!0,position:'bc',message:langpak.key_15+error,status:'danger'});
        } else if(ws_data.startsWith('user_px')) {
            user_px=ws_data.split(";")[1];
            localStorage.setItem("cnt_user",user_px);
            waitForElm('.cnt_user').then((elm) => {
                $(elm).html(user_px);
            });
        } else if(ws_data.startsWith('place_data')) {
            place_data=JSON.parse(ws_data.split(";")[1]);
            place_mode=place_data.mode;
            data=place_data.data;
            px_x=place_data.width;
            px_y=place_data.height;
            writing=place_data.writing;
            creator=place_data.creator;

            if(place_mode=='time') {
                $('#general_actions').append('<button class=\'action\' id=\'place_mode\' title=\'Time Mode\'><img src=\'./img/mode_time_icone.png\'></button>');
            } else if(place_mode=='price') {
                $('#general_actions').append('<button class=\'action\' id=\'place_mode\' title=\'Price Mode\'><img src=\'./img/mode_price_icone.png\'></button>');
            }

            if(creator==user) {
                html="<button onclick=\"change_size('new_size_x', "+px_x+");\">+</button>";
                html+="<input id='new_size_x' type='text' value='"+px_x+"' onchange=\"check_size('new_size_x', "+px_x+");\" />";
                html+="<button onclick=\"change_size('new_size_y', "+px_y+");\">+</button>";
                html+="<input id='new_size_y' type='text' value='"+px_y+"' onchange=\"check_size('new_size_y', "+px_y+");\" />";
                html+="<button onclick='new_size();'>"+langpak.key_16+"</button>";

                html+="<select id='place_select_mode' onchange='change_mode()''>";

                html+="    <option value='free'"
                if(place_mode == 'free') {
                    html+=" selected";
                }
                html+=">"+langpak.key_41+"</option>"

                html+="    <option value='time'"
                if(place_mode == 'time') {
                    html+=" selected";
                }
                html+=">"+langpak.key_42+"</option>"

                html+="    <option value='price'"
                if(place_mode == 'price') {
                    html+=" selected";
                }
                html+=">"+langpak.key_43+"</option>"

                html+="</select>";

                if(writing) {
                    html+="<button onclick=\"write_mode('F');\">"+langpak.key_17+"</button>";
                } else {
                    html+="<button onclick=\"write_mode('T');\">"+langpak.key_18+"</button>";
                }

                html+="<button onclick='clear_place();'>"+langpak.key_19+"</button>";
                $('#creator').append(html);
            }

            place_current_size = place_draw(ctx, data, currentZoom, px_x, px_y, place_current_size, true, false);
            SnackBar({fixed:!0,position:'bc',message:langpak.key_20,status:'success'});

            if(writing) {
                $('.cnt_user').click(function(){
                    alert('OK');
                    $(this).parent().hide();
                });
                SnackBar({fixed:!0,position:'tr',message:pseudo,timeout:0,actions:[{text:'cnt_user:',function:function(){SnackBar({fixed:!0,position:'tr',message:langpak.key_37,timeout:1e4,width:"400px",actions: [{text: langpak.key_48,dismiss: true}]})}},{text:langpak.key_33,function:function(){getLogout()}}]});
            } else {
                SnackBar({fixed:!0,position:'tr',message:langpak.key_22,status:'warning',icon:'!',timeout:0});
                $('#overlay_add').remove();
                $('#poss_info').css('bottom','305px');
                $('#return_home').css('bottom','248px');
                $('#stopMove').css('bottom','188px');
                $('#razPos').css('bottom','128px');
                $('#zoomUp').css('bottom','68px');
                $('#zoomDown').css('bottom','8px');
            }

            $('#loading').hide();
        } else if(ws_data.startsWith('new_size')) {
            place_data = ws_data.split(';');
            from_session = place_data[1];
            if(from_session == session) {
                px_x = place_data[2];
                px_y = place_data[3];
                place_current_size = place_draw(ctx, data, currentZoom, px_x, px_y, place_current_size, true, false);
                SnackBar({fixed:!0,position:'bc',message:langpak.key_23,status:'info'});
            }
        } else if(ws_data.startsWith('new_px')) {
            lst_data = ws_data.split(';');
            p_sess = lst_data[2];
            if (session == p_sess) {
                p_user = lst_data[1];
                p_poss = lst_data[3];
                p_data = lst_data[4];
                p_data = JSON.parse(p_data);
                data[p_poss] = p_data;
                place_current_size = place_draw(ctx, data, currentZoom, px_x, px_y, place_current_size, false, false);
            }
        } else if(ws_data.startsWith('del_px')) {

            lst_data = ws_data.split(';');
            p_sess = lst_data[2];
            if (session == p_sess) {
                p_user = lst_data[1];
                p_poss = lst_data[3];
                delete data[p_poss];
                place_current_size = place_draw(ctx, data, currentZoom, px_x, px_y, place_current_size, false, false);
            }
        } else if(ws_data.startsWith('write_change')) {
            lst_data = ws_data.split(';');
            p_sess = lst_data[2];
            if (session == p_sess) {
                SnackBar({fixed:!0,position:'bc',message:langpak.key_24,status:'info'});
                setTimeout((function(){location.reload()}),1e3);
            }
        } else if(ws_data.startsWith('mode_change')) {
            lst_data = ws_data.split(';');
            p_sess = lst_data[2];
            if (session == p_sess) {
                SnackBar({fixed:!0,position:'bc',message:langpak.key_44,status:'info'});
                setTimeout((function(){location.reload()}),1e3);
            }
        } else if(ws_data.startsWith('del_all_px')) {
            lst_data = ws_data.split(';');
            p_sess = lst_data[2];
            if (session == p_sess) {
                data = {};
                place_current_size = place_draw(ctx, data, currentZoom, px_x, px_y, place_current_size, false, false);
                SnackBar({fixed:!0,position:'bc',message:langpak.key_25,status:'info'});
            }
        } else if(ws_data.startsWith('place_create')) {
            lst_data = ws_data.split(';');
            p_sess = lst_data[1];
            SnackBar({fixed:!0,position:'tc',message:langpak.key_26+p_sess+langpak.key_27,status:'info',timeout:0});
            setTimeout((function(){location.reload()}),5e3);
        } else {
            console.log(ws_data);
        }
    }

    // place init data
    var data={};
    function place_draw(ctx, data, px_size, px_x, px_y, place_current_size, first_load=false, zoom=false) {
        var place_w = parseInt(px_size * px_x, 10);
        var place_h = parseInt(px_size * px_y, 10);

        ctx.canvas.height=place_h,ctx.canvas.width=place_w,ctx.lineWidth=1,ctx.strokeStyle='#00000020';
        var nb_l=parseInt(place_h/px_size,10),nb_c=parseInt(place_w/px_size,10),cnt_l=0,cnt_c=0;

        for(;cnt_l<=nb_l;)ctx.beginPath(),ctx.moveTo(0,px_size*cnt_l),ctx.lineTo(place_w,px_size*cnt_l),ctx.stroke(),cnt_l++;
        for(;cnt_c<=nb_c;)ctx.beginPath(),ctx.moveTo(px_size*cnt_c,0),ctx.lineTo(px_size*cnt_c,place_h),ctx.stroke(),cnt_c++;

        $.map(data, function(values, key) {
            poss = key.split('-')
            ctx.fillStyle = values['color'];
            ctx.fillRect(poss[0] * currentZoom, poss[1] * currentZoom, currentZoom, currentZoom);
        });

        if (first_load) {
            position = localStorage.getItem('position');
            if(position) {
                position = position.split(';');
                $('#place').css({'left': parseFloat(position[0]), 'top': parseFloat(position[1])});
            } else {
                $('#place').css('top','calc(50% - '+place_h/2+'px)').css('left','calc(50% - '+place_w/2+'px)');
            }
            $('#session').fadeIn(300);
        } else if (zoom) {
            position = $('#place').position();
            position = [position.top, position.left];

            var w = parseInt(place_current_size[0], 10);
            var h = parseInt(place_current_size[1], 10);

            // 3- zoom in / +1 zoom out
            var cur_w = (3 - ((200 * mouseX / window.innerWidth) / 100)).toFixed(3);
            var cur_h = (3 - ((200 * mouseY / window.innerHeight) / 100)).toFixed(3);

            var calc_w = parseInt(position[1] - ((place_w - place_current_size[0]) / cur_w), 10)
            var calc_h = parseInt(position[0] - ((place_h - place_current_size[1]) / cur_h), 10)

            // recadrage pour le zoom
            $('#place').css('top',calc_h.toString()+'px').css('left',calc_w.toString()+'px');

            position = calc_h.toString() + ';' + calc_w.toString();
            localStorage.setItem('position', position);
        }
        return [place_w, place_h];
    }

    zoom = localStorage.getItem('zoom');
    zoom&&(currentZoom=parseInt(zoom,10));

    // zoom
    function zoomUp() {
        $('#loading').show();
        place_current_size=place_draw(ctx,data,currentZoom+=1,px_x,px_y,place_current_size,!1,!0),currentZoom>maxZoom&&(currentZoom=maxZoom,place_current_size=place_draw(ctx,data,currentZoom,px_x,px_y,place_current_size,!1,!0));
        localStorage.setItem('zoom', currentZoom.toString());
        $('#loading').hide();
    }

    function zoomDown() {
        $('#loading').show();
        place_current_size=place_draw(ctx,data,currentZoom-=1,px_x,px_y,place_current_size,!1,!0),currentZoom<minZoom&&(currentZoom=minZoom,place_current_size=place_draw(ctx,data,currentZoom,px_x,px_y,place_current_size,!1,!0));
        localStorage.setItem('zoom', currentZoom.toString());
        $('#loading').hide();
    }

    $(document).bind('mousewheel DOMMouseScroll', function(e){
        e.originalEvent.wheelDelta/120>0?zoomUp():zoomDown();
        localStorage.setItem('zoom', currentZoom.toString());
    }).on('mousedown', function (e1) {
        $(document).one('mouseup', function (e2) {
            e2.preventDefault();
            if (e1.which == 2 && e1.target == e2.target) {
                $('#loading').show();
                currentZoom = 5;
                place_current_size = place_draw(ctx, data, currentZoom, px_x, px_y, place_current_size, false, true);
                localStorage.setItem('zoom', currentZoom.toString());
                razPos();
                $('#loading').hide();
            }
        });
    });

    // color pic
    $('.colorPickSelector').colorPick({initialColor:initColor,allowRecent:!0,recentMax:8,allowCustomColor:!0,palette:['#FF8A80', '#FF5252', '#FF1744', '#D50000', '#FF80AB', '#FF4081', '#F50057', '#C51162', '#EA80FC', '#E040FB', '#D500F9', '#AA00FF', '#B388FF', '#7C4DFF', '#651FFF', '#6200EA', '#8C9EFF', '#536DFE', '#3D5AFE', '#304FFE', '#82B1FF', '#448AFF', '#2979FF', '#2962FF', '#80D8FF', '#40C4FF', '#00B0FF', '#0091EA', '#84FFFF', '#18FFFF', '#00E5FF', '#00B8D4', '#A7FFEB', '#64FFDA', '#1DE9B6', '#00BFA5', '#B9F6CA', '#69F0AE', '#00E676', '#00C853', '#CCFF90', '#B2FF59', '#76FF03', '#64DD17', '#F4FF81', '#EEFF41', '#C6FF00', '#AEEA00', '#FFFF8D', '#FFFF00', '#FFEA00', '#FFD600', '#FFE57F', '#FFD740', '#FFC400', '#FFAB00', '#FFD180', '#FFAB40', '#FF9100', '#FF6D00', '#FF9E80', '#FF6E40', '#FF3D00', '#DD2C00', '#6D4C41', '#5D4037', '#4E342E', '#3E2723', '#757575', '#616161', '#424242', '#212121', '#546E7A', '#455A64', '#37474F', '#263238', '#000000', '#FFFFFF'],onColorSelected:function(){this.element.css({backgroundColor:this.color,color:this.color}),currentColor=this.color,localStorage.setItem('color',currentColor)}});

    // zplace colors ['#000000', '#333434', '#D4D7D9', '#FFFFFF', '#6D302F', '#9C451A', '#6D001A', '#BE0027', '#FF2651', '#FF2D00', '#FFA800', '#FFB446', '#FFD623', '#FFF8B8', '#7EED38', '#00CC4E', '#00A344', '#598D5A', '#004B6F', '#009EAA', '#00CCC0', '#33E9F4', '#5EB3FF', '#245AEA', '#313AC1', '#1832A4', '#511E9F', '#6A5CFF', '#33E9F4', '#B44AC0', '#FF63AA', '#E4ABFF']

    // add px
    function getCursorPosition(canvas,event,drop=false) {
        if (!writing) {
            return;
        }
        const rect=canvas.getBoundingClientRect()
        var x=event.clientX-rect.left;
        var y=event.clientY-rect.top;
        x=parseInt(x,10)-(x%currentZoom);
        y=parseInt(y,10)-(y%currentZoom);

        poss=Math.ceil(x/currentZoom).toString()+'-'+Math.ceil(y/currentZoom).toString();

        if (drop) {
            if (poss in data) {
                wsocket.send('remove;'+user+';'+session+';'+poss);
                if(creator==user) {
                    delete data[poss];
                    place_draw(ctx,data,currentZoom,px_x,px_y,place_current_size,!1,!1);
                }
            }
        } else {
            price = 1;
            if(place_mode=='time') {
                if(poss in data) {
                    const dnow = new Date();
                    const date = new Date(data[poss].last_update);
                    const diff = Math.floor((dnow - date) / 1000);
                    if (diff < delta_pxs) {
                        SnackBar({fixed:!0,position:'bc',message:langpak.key_45,status:'info'});
                        return;
                    }
                }
            } else if(place_mode=='price') {
                var cnt_user=localStorage.getItem('cnt_user');
                if (!cnt_user) {
                    SnackBar({fixed:!0,position:'bc',message:langpak.key_38,status:'danger'});
                    return;
                }
                if (poss in data) {
                    price = data[poss].price;
                }
                cnt_next = parseInt(cnt_user, 10) - price;
                if (cnt_next<=0) {
                    SnackBar({fixed:!0,position:'bc',message:langpak.key_39,status:'danger'});
                    return;
                }

            }
            ctx.fillStyle=currentColor;
            ctx.fillRect(Math.ceil(x),Math.ceil(y),currentZoom,currentZoom);
            data[poss]={color:currentColor,user:user,price:(price+1),last_update:(new Date).toUTCString()};
            new Audio('./musics/click.mp3').play();
            wsocket.send('add;'+user+';'+session+';'+poss+';'+JSON.stringify(data[poss]));
        }

        $.map(data, function(values, key) {
            poss=key.split('-')
            ctx.fillStyle=values['color'];
            ctx.fillRect(poss[0]*currentZoom,poss[1]*currentZoom,currentZoom,currentZoom);
        });
    }

    const canvas = document.querySelector('canvas');
    canvas.addEventListener('dblclick',(function(n){getCursorPosition(canvas,n)}));
    canvas.addEventListener('contextmenu',(function(n){n.preventDefault(),getCursorPosition(canvas,n,!0)}));

    // cursor tracking ---------------------------------->
    $('#place').mousemove(function(e) {
        const rect=canvas.getBoundingClientRect();
        var clientX=event.clientX,clientY=event.clientY;
        var x=clientX-rect.left,y=clientY-rect.top;
        x = parseInt((x/currentZoom)+1, 10);
        y = parseInt((y/currentZoom)+1, 10);

        key=parseInt(x-1,10).toString()+'-'+parseInt(y-1,10).toString();
        $('#poss_info').html(x.toString()+' | '+y.toString());

        if(writing && key in data) {
            html='<div>'+langpak.key_29+data[key].color+'</div>';
            // html+='<div>'+langpak.key_30+data[key].user+'</div>';
            if(place_mode=='price') {
                html+='<div>'+langpak.key_31+data[key].price+'</div>';
            }
            else if(place_mode=='time') {
                const dnow = new Date();
                const date = new Date(data[key].last_update);
                const diff = Math.floor((dnow - date) / 1000);
                if (diff < delta_pxs) {
                    html+='<div>'+langpak.key_46+(delta_pxs - diff)+langpak.key_47+'</div>';
                }
            }
            html+='<div>'+langpak.key_32+data[key].last_update+'</div>';
            $('#px_info').css('top',clientY.toString()+'px').css('left',clientX.toString()+'px').html(html).css('opacity', '0.8');
        } else {
            $('#px_info').css('opacity','0.0').html('');
        }
    }).mouseleave(function() {
        $('#poss_info').html('');
        $('#px_info').css('opacity','0.0').html('');
    });
    // cursor tracking ---------------------------------->

    // interface actions
    $(document).ready(function(){
        $('#place').draggable({
            drag:function(event,ui){
                position=parseInt(ui.position.left,10).toString()+';'+parseInt(ui.position.top,10).toString();
                localStorage.setItem('position',position);
            },
            start:function(event,ui){
                clicked=!1;
            }
        }).click((function(){clicked=!0})).dblclick((function(){clicked=!0}));
        $(document).mousemove((function(e){mouseX=e.pageX,mouseY=e.pageY})).mouseover();
    });
    wsocket.onopen=s=>{
        wsocket.send('init;'+user);
        wsocket.send('load;'+user+';'+session);
        $('#loading').show();
    };
} else if (user) {
    var redirect=localStorage.getItem('redirect');
    redirect&&(window.location.hash=redirect,location.reload(),localStorage.removeItem('redirect'));
    wsocket.onopen=e=>{user&&wsocket.send('init;'+user),wsocket.send('list;'+user)};
    wsocket.onmessage=e=>{
        ws_data=e.data;
        if(ws_data == 'wip') {
            wip_show();
        } else if(ws_data.startsWith('user_px')) {
            user_px=ws_data.split(';')[1];
            localStorage.setItem('cnt_user',user_px);
            $('.cnt_user').html(user_px);
        } else if(ws_data.startsWith('place_list')) {
            place_list=ws_data.split(";")[1];
            place_list=place_list.replaceAll("'", '"');
            place_list=JSON.parse(place_list);
            $.each(place_list, function(key, value){
                $('#place_list').append('<div onclick="place_select(\'' + value + '\');">' + value + '<div>')
            });
        }
    };
    $('.cnt_user').click(function(){
        alert('OK');
        $(this).parent().hide();
    });
    SnackBar({fixed:!0,position:'tc',message:pseudo,timeout:0,actions:[{text:'cnt_user:',function:function(){SnackBar({fixed:!0,position:'bc',message:langpak.key_37,timeout:1e4,width:"400px",actions: [{text: langpak.key_48,dismiss: true}]})}},{text:langpak.key_33,function:function(){getLogout()}}]});
    $('#home .title').delay(500).animate({opacity:1},300);
    $('#go_auth, #go_gest').remove();
    $('#go_place, #new_session, #place_list').show();
    $('#go_place').click((function(){getPlace()}));
    $('#new_session').keypress((function(o){'13'==(o.keyCode?o.keyCode:o.which)&&(window.location.hash='#'+$('#new_session').val(),location.reload())})).focus();
}
