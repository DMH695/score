package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type Student struct {
	StudentNo string `json:"student_no"`
	Name      string `json:"name"`
}

func main() {
	students := []Student{
		{StudentNo: "01", Name: "黄和杰"},
		{StudentNo: "02", Name: "陈艳琳"},
		{StudentNo: "03", Name: "黄嘉琪"},
		{StudentNo: "04", Name: "曹欣怡"},
		{StudentNo: "05", Name: "傅怡菲"},
		{StudentNo: "06", Name: "陈佳琳"},
		{StudentNo: "07", Name: "陈标炎"},
		{StudentNo: "08", Name: "钟志轩"},
		{StudentNo: "09", Name: "邹荇锴"},
		{StudentNo: "10", Name: "黄颖涵"},
		{StudentNo: "11", Name: "谢金淋"},
		{StudentNo: "12", Name: "丘梓琴"},
		{StudentNo: "13", Name: "李俊辉"},
		{StudentNo: "14", Name: "陈新才"},
		{StudentNo: "15", Name: "刘培鑫"},
		{StudentNo: "16", Name: "李凌微"},
		{StudentNo: "17", Name: "卢丽珍"},
		{StudentNo: "18", Name: "钟炳生"},
		{StudentNo: "19", Name: "张政涵"},
		{StudentNo: "20", Name: "廖静雯"},
		{StudentNo: "21", Name: "黄美淇"},
		{StudentNo: "22", Name: "陈开桢"},
		{StudentNo: "23", Name: "林永涛"},
		{StudentNo: "24", Name: "王炜豪"},
		{StudentNo: "25", Name: "阙志翔"},
		{StudentNo: "26", Name: "阙涵"},
		{StudentNo: "27", Name: "黄若宸"},
		{StudentNo: "28", Name: "廖晓珺"},
		{StudentNo: "29", Name: "钟谨宇"},
		{StudentNo: "30", Name: "傅美琦"},
		{StudentNo: "31", Name: "林艳茹"},
		{StudentNo: "32", Name: "梁诗瑶"},
		{StudentNo: "33", Name: "林静"},
		{StudentNo: "34", Name: "张先文"},
		{StudentNo: "35", Name: "黄功耀"},
		{StudentNo: "36", Name: "邱德鹏"},
		{StudentNo: "37", Name: "黄富涛"},
		{StudentNo: "38", Name: "张彦珍"},
		{StudentNo: "39", Name: "钟玉媛"},
		{StudentNo: "40", Name: "陈煜"},
		{StudentNo: "41", Name: "阙靖淇"},
		{StudentNo: "42", Name: "黄传锦"},
		{StudentNo: "43", Name: "陈菲"},
		{StudentNo: "44", Name: "邹靓萍"},
		{StudentNo: "45", Name: "黄福诚"},
		{StudentNo: "46", Name: "黄新涛"},
		{StudentNo: "47", Name: "陈玲"},
		{StudentNo: "48", Name: "陈福清"},
		{StudentNo: "49", Name: "黄小珍"},
		{StudentNo: "50", Name: "黄传钦"},
	}

	data := map[string][]Student{"students": students}
	jsonData, _ := json.Marshal(data)

	req, _ := http.NewRequest("POST", "http://localhost:8080/api/admin/students/batch", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Admin-Password", "admin123")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("请求失败:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 {
		fmt.Println("成功导入 50 名学生！")
	} else {
		fmt.Printf("导入失败，状态码: %d\n", resp.StatusCode)
	}
}
