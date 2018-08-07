function convertforProcessing(Matrix,cols,dimensions_count)
{
    var data=[];
    //var cols=[];
    var clusterinput=[];
    $.each(Matrix,function(index,item){
    data[index]={};
    clusterinput_row=[];
    $.each(cols,function(col_index,col){
        data[index][col]= col_index<= dimensions_count-1 ? item[col_index].qText : item[col_index].qNum;
        if (col_index<= dimensions_count-1){
            data[index]["qElem"]=item[col_index].qElemNumber
           }
        else{
            clusterinput_row.push(isNaN(item[col_index].qNum)?0: item[col_index].qNum);
        }
        
        data[index][col+"display"]= item[col_index].qText;						
        
    })
    clusterinput.push(clusterinput_row);
    
    })
    return {"data":data,"clusterInput": clusterinput} ;

}

function convertforVisuals(pClusterAssignment, pData)
{
    var data=[];
    var clusterinput=[];
    $.each(pData,function(index,item){
    item["cluster"]=pClusterAssignment[index];
    })
    return pData ;

}
			