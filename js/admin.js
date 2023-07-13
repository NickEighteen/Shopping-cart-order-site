const orderList = document.querySelector(".js-orderList");
const deleteAllOrderBtn = document.querySelector('.discardAllBtn');
let orderData = [];
// 資料初始化
function init() {
   getOrderList();
}
init();
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          'Authorization': token,
        }
      })
      .then(function (response) {
        orderData = response.data.orders;        
        let str = '';
        orderData.forEach(function (item) {
          // 組產品字串
          let productStr = "";
          item.products.forEach(function(productItem){
             productStr +=`<p>${productItem.title}*${productItem.quantity}</p>`
          })
          // 判斷訂單狀態
          let orderStatus = "";
          if(item.paid == true){
            orderStatus = "已處理";
          }else{
            orderStatus = "未處理";
          }
          // 組日期字串
          const timeStamp = new Date(item.createdAt*1000);
          const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
          // 組訂單字串            
          str +=`<tr>
                    <td>${item.id}</td>
                    <td>
                        <p>${item.user.name}</p>
                        <p>${item.user.tel}</p>
                    </td>
                    <td>${item.user.address}</td>
                    <td>${item.user.email}</td>
                    <td>
                        ${productStr}
                    </td>
                    <td>${orderTime}</td>
                    <td class="orderStatus">
                        <a href="#" class="js-orderStatus" data-id="${item.id}" data-status="${item.paid}">${orderStatus}</a>
                    </td>
                    <td>
                        <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                    </td>
                 </tr>`
        })
        orderList.innerHTML = str;
        //renderC3();
        renderC3_lv2();
      })
}
//
orderList.addEventListener('click',function(e){
    e.preventDefault();
    let targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    if(targetClass == "js-orderStatus"){        
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(id,status);
        return;
    }
    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id);
        return;
    }
})
//修改訂單狀態
function changeOrderStatus(id,status){    
    let newStatus;    
    if(status === "true"){       
       newStatus = false;
    }else{       
       newStatus = true; 
    }    
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": id,
        "paid": newStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      alert("修改訂單狀態完成");
      getOrderList();
    })
}
// 刪除單筆訂單
function deleteOrderItem(orderId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
       alert("刪除該筆訂單成功");
       getOrderList();
    })
}
// 刪除全部訂單
deleteAllOrderBtn.addEventListener('click',function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
      {
        headers: {
          'Authorization': token
        }
      })
      .then(function (response) {
        alert("刪除全部訂單成功")
        getOrderList();
      })
})
// C3繪製 Lv1
function renderC3() {
// 物件資料蒐集
let total = {};
orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
    if (total[productItem.category] == undefined) {
        total[productItem.category] = productItem.price * productItem.quantity
    } else {
        total[productItem.category] += productItem.price * productItem.quantity
    }
    })
})
// 做出資料關聯
let categoryAry = Object.keys(total);
// 透過 total + categoryAry 組出 C3 格式
let newData = [];
categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    newData.push(ary);    
})
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
    columns: newData, // 資料存放,
    type: "pie"
    }
});
}
// C3繪製 Lv2
function renderC3_lv2() {
// 物件資料蒐集
let total = {};
orderData.forEach(function (item) {
    item.products.forEach(function (productItem) {
    if (total[productItem.title] == undefined) {
        total[productItem.title] = productItem.price * productItem.quantity
    } else {
        total[productItem.title] += productItem.price * productItem.quantity
    }
    })
})
// 做出資料關聯
let categoryAry = Object.keys(total);
// 透過 total + categoryAry 組出 C3 格式
let rankSortAry = [];
categoryAry.forEach(function (item) {
    let ary = [];
    ary.push(item);
    ary.push(total[item]);
    rankSortAry.push(ary);    
})
// 比較大小 降冪排列 ( 目的:取營收前3名的品項當主要色塊,其餘的品項加總起來當一個色塊)
rankSortAry.sort(function(a,b){
   return b[1] - a[1];
})
// 如果筆數超過4筆,就將第4筆之後的品項統整為其他
if(rankSortAry.length > 3){
   let otherTotal = 0;
   rankSortAry.forEach(function(item,index){
      if(index > 2){
        otherTotal += rankSortAry[index][1];
      }        
   })
   rankSortAry.splice(3,rankSortAry.length-3);
   rankSortAry.push(['其他',otherTotal]);   
}
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
    columns: rankSortAry, // 資料存放,
    type: "pie"
    }
});
}

