var A="00";
var B="00";
var C="00";
var D="00";
var E="00";
var H="00";
var L="00";
var M="00";
var SOD=0;
var SID=0;
var INTR=0;
var TRAP=0;
var R7_5=0;
var MSE=0;
var M7_5=0;
var M6_5=0;
var M5_5=0;
var SDE=0;
var I7_5=0;
var I6_5=0;
var I5_5=0;
var IE=0;
var bin_A="00000000";
var bin_B="00000000";
var bin_C="00000000";
var bin_D="00000000";
var bin_E="00000000";
var bin_H="00000000";
var bin_L="00000000";
var bin_M="00000000";
var pendingCheck=null;

var Stack_pointer="0000";
var Memory_pointer="0000";
var PSW="0000";
var clock_cycle_counter=0;
var instruction_counter=0;
var Memory=new Array(65536);
var Label=new Array();
var ioAddressMemory=new Array(256);
var PC=0;
var status_flag=0;
var carry_flag=0;
var zero_flag=0;
var parity_flag=0;
var auxillary_carry_flag=0;
var sign_flag=0;
var instruction;
var args=new Array();

function setBinary(){
	bin_A=(new Binary(hex_to_dec(A.charAt(0)))).print(4);
	bin_A+=(new Binary(hex_to_dec(A.charAt(1)))).print(4);
	bin_B=(new Binary(hex_to_dec(B.charAt(0)))).print(4);
	bin_B+=(new Binary(hex_to_dec(B.charAt(1)))).print(4);
	bin_C=(new Binary(hex_to_dec(C.charAt(0)))).print(4);
	bin_C+=(new Binary(hex_to_dec(C.charAt(1)))).print(4);
	bin_D=(new Binary(hex_to_dec(D.charAt(0)))).print(4);
	bin_D+=(new Binary(hex_to_dec(D.charAt(1)))).print(4);
	bin_E=(new Binary(hex_to_dec(E.charAt(0)))).print(4);
	bin_E+=(new Binary(hex_to_dec(E.charAt(1)))).print(4);
	bin_H=(new Binary(hex_to_dec(H.charAt(0)))).print(4);
	bin_H+=(new Binary(hex_to_dec(H.charAt(1)))).print(4);
	bin_L=(new Binary(hex_to_dec(L.charAt(0)))).print(4);
	bin_L+=(new Binary(hex_to_dec(L.charAt(1)))).print(4);
	bin_M=(new Binary(hex_to_dec(M.charAt(0)))).print(4);
	bin_M+=(new Binary(hex_to_dec(M.charAt(1)))).print(4);
}

function parseLabel(code){
	var replacement=new Array();
	var linecount=0;
	for(var i=0,l=code.length;i<l;++i){
		temprep=getLine(code[i],dec_to_hex(linecount,4));
		if(temprep)
			code[i]=code[i].substring((code[i].indexOf(":")+1),code[i].length).trim();
		switch(instruction){
			case "NOP":
			case "HLT":
			case "DI":
			case "EI":
			case "RIM":
			case "SIM":
			case "CMP":
			case "ANA":
			case "XRA":
			case "ORA":
			case "RLC":
			case "RRC":
			case "RAL":
			case "RAR":
			case "CMA":
			case "CMC":
			case "STC":
			case "RET":
			case "RC":
			case "RNC":
			case "RP":
			case "RM":
			case "RZ":
			case "RNZ":
			case "RPE":
			case "RPO":
			case "PCHL":
			case "RST":
			case "ADD":
			case "ADC":
			case "DAD":
			case "SUB":
			case "SBB":
			case "INR":
			case "INX":
			case "DCR":
			case "DCX":
			case "DAA":
			case "MOV":
			case "LDAX":
			case "STAX":
			case "XCHG":
			case "SPHL":
			case "XTHL":
			case "PUSH":
			case "POP":
						linecount++;
						break;
			case "CPI":
			case "ANI":
			case "XRI":
			case "ORI":
			case "ADI":
			case "ACI":
			case "SUI":
			case "SBI":
			case "MVI":
			case "OUT":
			case "IN":
						linecount+=2;
						break;
			case "JMP":
			case "JC":
			case "JP":
			case "JM":
			case "JZ":
			case "JNZ":
			case "JPE":
			case "JPO":
			case "CC":
			case "CALL":
			case "CNC":
			case "CP":
			case "CM":
			case "CZ":
			case "CNZ":
			case "CPE":
			case "CPO":
			case "LXI":
			case "LDA":
			case "LHLD":
			case "STA":
			case "SHLD":
						linecount+=3;
						break;
		}
		switch(instruction){
			case "JMP":
			case "JC":
			case "JP":
			case "JM":
			case "JZ":
			case "JNZ":
			case "JPE":
			case "JPO":
			case "CC":
			case "CALL":
			case "CNC":
			case "CP":
			case "CM":
			case "CZ":
			case "CNZ":
			case "CPE":
			case "CPO":
			if(!isHex(args[0]))
				replacement[replacement.length]=i;
		}
	}
	for(var i=0,l=replacement.length;i<l;++i){
		smple=code[replacement[i]];
		smple=smple.trim();
		code[replacement[i]]=smple.substring(0,smple.indexOf(" "))+" "+getLabel(smple.substr(smple.indexOf(" ")+1,smple.length));
	}
	return code;
}

function checkParity(bitselect){
	var p=true;
	var sel;
	switch(bitselect){
		case 'A': sel=bin_A ;
		break;
		case 'B': sel=bin_B ;
		break;
		case 'C': sel=bin_C ;
		break;
		case 'D': sel=bin_D ;
		break;
		case 'E': sel=bin_E ;
		break;
		case 'H': sel=bin_H ;
		break;
		case 'L': sel=bin_L ;
		break;
		case 'M': sel=bin_M ;
		break;
	}
	for(var i=0;i<8;++i)
					if(sel.charAt(i)=='1'){
						if(p)
							p=false;
						else p=true;
				}
	if(p)
		parity_flag=1;
	else parity_flag=0;
}

function setLabel(x,y){  //x is the Label name. y is the address of the label(PC).
	var l=Label.length;
	for(var i=0;i<l;++i)
		if(Label[i][0]==x)
			throw alert("Error!\nSame label name is declared twice or more");
	Label[l]=new Array(2);
	Label[l][0]=x;
	Label[l][1]=y;
}

function getLabel(x){
	for(var i=0,l=Label.length;i<l;++i)
		if(Label[i][0]==x)
			return Label[i][1];
	throw alert("Error!\nNo Such Label as "+x+" is declared");    //throw error
}

function setCode(cod){
	Memory[PC]=cod;
	++PC;
}

function setMemory(memLoc,memData){
	Memory[hex_to_dec(memLoc)]=memData;
}

function getMemory(memLoc){
	var ret=Memory[hex_to_dec(memLoc)];
	if(ret==null)
	return "00";
	else return ret;
}

function setIOMemory(memLoc,memData){
	ioAddressMemory[hex_to_dec(memLoc)]=memData;
}

function getIOMemory(memLoc){
	var ret=ioAddressMemory[hex_to_dec(memLoc)];
		if(ret==null)
	return "00";
		else return ret;
}

function getLine(line,addr=null){  //parse the given line and store relative data at instruction and args;
if(addr==null)
	addr=PC;
var check_flag=false;
	var code=new Array();
	var word="";
	var flag="Label";
	var temp="";
	for(var i=0,l=line.length;i<l;++i){
		if(line[i]==' '){
			code[code.length]=word;
			word="";
		}
		else word+=line[i];
	}
	if(word.length>0)
		code[code.length]=word;
	for(var i=0,l=code.length;i<l;++i){
		if(flag=="Label"){
			if(code[i][code[i].length-1]==':'){
			setLabel(code[i].substr(0,code[i].length-1),addr);
			check_flag=true;
		} else{
			flag="instruction";
			i--;
		}
		}
		else{
		if(flag=="instruction"){
			instruction=code[i];
			flag="argument";
		}
		else{
			for(var j=0,l=code[i].length;j<l;++j){
				if(code[i][j]==','){
					args[args.length]=temp;
					temp="";
				}else
				temp+=code[i][j];
			}
			if(temp.length>0)
				args[args.length]=temp;
			break;
		}
			
		}
	}
	return check_flag;
}

function execline(){
	if(instruction=="NOP")
		;
	else if(instruction=="HLT")
		return true;
	else if(instruction=="DI")
		DI();
	else if(instruction=="EI")
		EI();
	else if(instruction=="RIM")
		RIM();
	else if(instruction=="SIM")
		SIM();
	else if(instruction=="CMP")
		CMP();
	else if(instruction=="CPI")
		CPI();
	else if(instruction=="ANA")
		ANA();
	else if(instruction=="ANI")
		ANI();
	else if(instruction=="XRA")
		XRA();
	else if(instruction=="XRI")
		XRI();
	else if(instruction=="ORA")
		ORA();
	else if(instruction=="ORI")
		ORI();
	else if(instruction=="RLC")
		RLC();
	else if(instruction=="RRC")
		RRC();
	else if(instruction=="RAL")
		RAL();
	else if(instruction=="RAR")
		RAR();
	else if(instruction=="CMA")
		CMA();
	else if(instruction=="CMC")
		CMC();
	else if(instruction=="STC")
		STC();
	else if(instruction=="JMP")
		JMP();
	else if(instruction=="JC")
		JC();
	else if(instruction=="JNC")
		JNC();
	else if(instruction=="JP")
		JP();
	else if(instruction=="JM")
		JM();
	else if(instruction=="JZ")
		JZ();
	else if(instruction=="JNZ")
		JNZ();
	else if(instruction=="JPE")
		JPE();
	else if(instruction=="JPO")
		JPO();
	else if(instruction=="CALL")
		CALL();
	else if(instruction=="CC")
		CC();
	else if(instruction=="CNC")
		CP();
	else if(instruction=="CM")
		CM();
	else if(instruction=="CZ")
		CZ();
	else if(instruction=="CNZ")
		CNZ();
	else if(instruction=="CPE")
		CPE();
	else if(instruction=="CPO")
		CPO();
	else if(instruction=="RET")
		RET();
	else if(instruction=="RC")
		RC();
	else if(instruction=="RNC")
		RNC();
	else if(instruction=="RP")
		RP();
	else if(instruction=="RM")
		RM();
	else if(instruction=="RZ")
		RZ();
	else if(instruction=="RNZ")
		RNZ();
	else if(instruction=="RPE")
		RPE();
	else if(instruction=="RPO")
		RPO();
	else if(instruction=="PCHL")
		PCHL();
	else if(instruction=="RST")
		RST();
	else if(instruction=="ADD")
		ADD();
	else if(instruction=="ADC")
		ADC();
	else if(instruction=="ADI")
		ADI();
	else if(instruction=="ACI")
		ACI();
	else if(instruction=="LXI")
		LXI();
	else if(instruction=="DAD")
		DAD();
	else if(instruction=="SUB")
		SUB();
	else if(instruction=="SBB")
		SBB();
	else if(instruction=="SUI")
		SUI();
	else if(instruction=="SBI")
		SBI();
	else if(instruction=="INR")
		INR();
	else if(instruction=="INX")
		INX();
	else if(instruction=="DCR")
		DCR();
	else if(instruction=="DCX")
		DCX();
	else if(instruction=="DAA")
		DAA();
	else if(instruction=="MOV")
		MOV();
	else if(instruction=="MVI")
		MVI();
	else if(instruction=="LDA")
		LDA();
	else if(instruction=="LDAX")
		LDAX();
	else if(instruction=="LXI")
		LXI();
	else if(instruction=="LHLD")
		LHLD();
	else if(instruction=="STA")
		STA();
	else if(instruction=="STAX")
		STAX();
	else if(instruction=="SHLD")
		SHLD();
	else if(instruction=="XCHG")
		XCHG();
	else if(instruction=="SPHL")
		SPHL();
	else if(instruction=="XTHL")
		XTHL();
	else if(instruction=="PUSH")
		PUSH();
	else if(instruction=="POP")
		POP();
	else if(instruction=="OUT")
		OUT();
	else if(instruction=="IN")
		IN();
	args=new Array();
	return false;
}

function hex_to_dec(x){
	var value=0;
	var l=x.length;
	var p=l-1;
	var t;
	for(var i=0;i<l;++i,--p){
		switch(x[i]){
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': t=parseInt(x[i]);
						break;
			case 'A': t=10;
					break;
			case 'B':t=11;
					break;
			case 'C':t=12;
					break;
			case 'D':t=13;
					break;
			case 'E':t=14;
					break;
			case 'F':t=15;
					break;
			default : throw "Not Hex";
		}
		value+=Math.pow(16,p)*t;
	}
	return value;
}

function Assemble(){
    Label=new Array();
	var Code=document.getElementById("AssemblyProgram").value.toUpperCase();
	var code=Code.split("\n");
	PC=hex_to_dec(document.getElementById("assemble_point").value);
	code=parseLabel(code);
	args=new Array();
	for(var i=0,l=code.length;i<l;++i){
		getLine(code[i]);
		try{sat=setInstructionCode();}
		catch(err){
			alert("Error at line "+(i+1)+"\nWrong operand for instruction "+instruction);
			return;
		}
		if(sat){
			alert("Error at line "+(i+1)+"\nUnknown instruction "+instruction);
			return;
		}
		args=new Array();
	}
	setMemoryTable();
}

function run(start=0){
	Reset();
	PC=start;
	var i=0;
	do{	pendingCheck=null;
		getInstructionCode();
		if(execline())
			break;
		status_flag=dec_to_hex((new Binary(""+sign_flag+zero_flag+0+auxillary_carry_flag+0+parity_flag+0+carry_flag)).toDecimal(),2);
		PSW="FF"+status_flag;
		instruction=null;
		setBinary();
		i++;
		if(pendingCheck!=null){
			checkParity(pendingCheck);
		}
		if(i>=500)
			if(confirm("It is taking too long!\nDo you want to continue?")==true) i=0;
			else break;
	}while(true);
}

function runstep(){
		instruction=null;
	getInstructionCode();
		ccargs=args;
		temprun=execline();
		status_flag=dec_to_hex((new Binary(""+sign_flag+zero_flag+0+auxillary_carry_flag+0+parity_flag+0+carry_flag)).toDecimal(),2);
		PSW="FF"+status_flag;
		setBinary();
		if(pendingCheck!=null)
			checkParity(pendingCheck);
		simulate();
		return [temprun,ccargs];
}

function Reset(){
	A="00";
	B="00";
	C="00";
	D="00";
	E="00";
	H="00";
	L="00";
	M="00";
	PC=0;
	carry_flag=0;
	zero_flag=0;
	parity_flag=0;
	auxillary_carry_flag=0;
	sign_flag=0;
	instruction=null;
	args=new Array();
	Label=new Array();
	ioAddressMemory=new Array(256);
	SOD=0;
	SID=0;
	INTR=0;
	TRAP=0;
	R7_5=0;
	MSE=0;
	M7_5=0;
	M6_5=0;
	M5_5=0;
	SDE=0;
	I7_5=0;
	I6_5=0;
	I5_5=0;
	IE=0;
	Stack_pointer="0000";
	Memory_pointer="0000";
	PSW="0000";
	clock_cycle_counter=0;
	instruction_counter=0;
}

function checkArg(argLength,argCat=null){ // argCat=0 for Registers, 1 for 8-bit data, 2 for 16 bit data, 3 for labels
	if(args.length!=argLength)
		 throw "Incorrect operand used!";
	else for(i=0;i<argLength;++i){
		if(argCat[i]==0)
			switch(args[i]){
				case "A" :
				case "B" :
				case "C" :
				case "D" :
				case "E" :
				case "H" :
				case "L" :
				case "M" : break;
				default : throw "Incorrect operand used!";
			}
		else  if(argCat[i]==1&&args[i].length!=2&&(!isHex(args[i])))
			 throw "Incorrect operand used!";
		else if(argCat[i]==2&&args[i].length!=4&&(!isHex(args[i])))
			 throw "Incorrect operand used!";
		 else if(argCat[i]==3&&!((args[i].length!=4&&(!isHex(args[i])))||args[i].length!=0))
			 throw "";
	}
	return null;
}

function isHex(x){
	for(var i=0,l=x.length;i<l;++i)
	switch(x[i]){
		case "0" :
		case "1" :
		case "2" :
		case "3" :
		case "4" :
		case "5" :
		case "6" :
		case "7" :
		case "8" :
		case "9" :
		case "A" :
		case "B" :
		case "C" :
		case "D" :
		case "E" :
		case "F" :
		default : return false;
	}
	return true;
}

function setInstructionCode(){
	switch(instruction){
		case "NOP" : checkArg(0);
					return ;
					break;
		case "HLT" : checkArg(0);
					setCode("76");
					break;
		case "DI" : checkArg(0);
					setCode("F3");
					break;
		case "EI" : checkArg(0);
					setCode("FB");
					break;
		case "RIM" : checkArg(0);
					setCode("20");
					break;
		case "SIM" : checkArg(0);
					setCode("30");
					break;
		case "CMP" : checkArg(1,[0]);
					switch(args[0]){
					case "A": setCode("BF");
							break;
					case "B": setCode("B8");
							break;
					case "C": setCode("B9");
							break;
					case "D": setCode("BA");
						break;
					case "E": setCode("BB");
					break;
					case "H": setCode("BC");
					break;
					case "L": setCode("BD");
					break;
					case "M": setCode("BE");
					break;
					}
					break;
		case "CPI" :checkArg(1,[1]); 
					setCode("FE");
					setCode(args[0]);
					break;
		case "ANA" :checkArg(1,[0]); 
					switch(args[0]){
					case "A": setCode("A7");
					break;
					case "B": setCode("A0");
					break;
					case "C": setCode("A1");
					break;
					case "D": setCode("A2");
					break;
					case "E": setCode("A3");
					break;
					case "H": setCode("A4");
					break;
					case "L": setCode("A5");
					break;
					case "M": setCode("A6");
					break;
					}
					break;
		case "ANI" :checkArg(1,[1]); 
					setCode("E6");
					setCode(args[0]);
					break;
		case "XRA" :checkArg(1,[0]); 
					switch(args[0]){
					case "A": setCode("AF");
					break;
					case "B": setCode("A8");
					break;
					case "C": setCode("A9");
					break;
					case "D": setCode("AA");
					break;
					case "E": setCode("AB");
					break;
					case "H": setCode("AC");
					break;
					case "L": setCode("AD");
					break;
					case "M": setCode("AE");
					break;
					};
					break;
		case "XRI" :checkArg(1,[1]); 
					setCode("EE");
					setCode(args[0]);
					break;
		case "ORA" :checkArg(1,[0]); 
					switch(args[0]){
					case "A": setCode("B7");
					break;
					case "B": setCode("B0");
					break;
					case "C": setCode("B1");
					break;
					case "D": setCode("B2");
					break;
					case "E": setCode("B3");
					break;
					case "H": setCode("B4");
					break;
					case "L": setCode("B5");
					break;
					case "M": setCode("B6");
					break;
					};
					break;
		case "ORI" :checkArg(1,[1]); 
					setCode("F6");
					setCode(args[0]);
					break;
		case "RLC" :checkArg(0); 
					setCode("07");
					break;
		case "RRC" :checkArg(0); 
					setCode("0F");
					break;
		case "RAL" :checkArg(0); 
					setCode("17");
					break;
		case "RAR" :checkArg(0); 
					setCode("1F");
					break;
		case "CMA" :checkArg(0); 
					setCode("2F");
					break;
		case "CMC" :checkArg(0); 
					setCode("3F");
					break;
		case "STC" :checkArg(0); 
					setCode("37");
					break;
		case "JMP" :checkArg(1,[3]); 
					setCode("C3");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JC" : checkArg(1,[3]);
					setCode("DA");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JNC" :checkArg(1,[3]); 
					setCode("D2");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JP" :checkArg(1,[3]); 
					setCode("F2");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JM" :checkArg(1,[3]); 
					setCode("FA");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JZ" :checkArg(1,[3]); 
					setCode("CA");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JNZ" :checkArg(1,[3]); 
					setCode("C2");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JPE" :checkArg(1,[3]); 
					setCode("EA");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "JPO" :checkArg(1,[3]); 
					setCode("E2");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CC" :checkArg(1,[3]); 
					setCode("DC");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CNC" :checkArg(1,[3]); 
					setCode("D4");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CP" :checkArg(1,[3]); 
					setCode("F4");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CM" :checkArg(1,[3]); 
					setCode("FC");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CZ" :checkArg(1,[3]); 
					setCode("CC");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CNZ" :checkArg(1,[3]); 
					setCode("C4");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CPE" :checkArg(1,[3]); 
					setCode("EC");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "CPO" :checkArg(1,[3]); 
					setCode("E4");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "RET" :checkArg(0);
					setCode("C9");
					break;
		case "RC" : checkArg(0);
					setCode("D8");
					break;
		case "RNC" :checkArg(0);
					setCode("D0");
					break;
		case "RP" : checkArg(0);
					setCode("F0");
					break;
		case "RM" : checkArg(0);
					setCode("F8");
					break;
		case "RZ" : checkArg(0);
					setCode("C8");
					break;
		case "RNZ" :checkArg(0);
					setCode("C0");
					break;
		case "RPE" :checkArg(0);
					setCode("E8");
					break;
		case "RPO" :checkArg(0);
					setCode("E0");
					break;
		case "PCHL" :checkArg(0);
					setCode("E9");
					break;
		case "RST" :if(args.length!=1)
					throw "Inappropriate parameter!";
					var a=parseInt(args[0]);
					switch(a){
						case 0:	setCode("C7");
								break;
						case 1: setCode("CF");
								break;
						case 2: setCode("D7");
								break;
						case 3: setCode("DF");
								break;
						case 4: setCode("E7");
								break;
						case 5: setCode("EF");
								break;
						case 6: setCode("F7");
								break;
						case 7: setCode("FF");
								break;
						default: throw "Inappropriate Parameter!";
					};
					break;
		case "ADD" :checkArg(1,[0]);
					switch(args[0]){
						case 'A': setCode("87");
						break;
						case 'B': setCode("80");
						break;
						case 'C': setCode("81");
						break;
						case 'D': setCode("82");
						break;
						case 'E': setCode("83");
						break;
						case 'H': setCode("84");
						break;
						case 'L': setCode("85");
						break;
						case 'M': setCode("86");
						break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "ADC" :checkArg(1,[0]);
					switch(args[0]){
						case "A": setCode("8F");
								break;
						case "B": setCode("88");
								break;
						case "C": setCode("89");
								break;
						case "D": setCode("8A");
								break;
						case "E": setCode("8B");
								break;
						case "H": setCode("8C");
								break;
						case "L": setCode("8D");
								break;
						case "M": setCode("8E");
								break;
						default: throw "Incorrect Parameter!";
					};
					break;
		case "ADI" :checkArg(1,[1]);
					setCode("C6");
					setCode(args[0]);
					break;
		case "ACI" :checkArg(1,[1]);
					setCode("CE");
					setCode(args[0]);
					break;
		case "LXI" :checkArg(2,[0,2]);
					switch(args[0]){
						case "B": setCode("01");
								setCode(args[1].substring(2,4));
								setCode(args[1].substring(0,2));
								break;
						case "D": setCode("11");
								setCode(args[1].substring(2,4));
								setCode(args[1].substring(0,2));
								break;
						case "H": setCode("21");
								setCode(args[1].substring(2,4));
								setCode(args[1].substring(0,2));
								break;
					};
					break;
		case "DAD" :checkArg(1,[0]);
					switch(args[0]){
						case "B": setCode("09");
								break;
						case "D": setCode("19");
								break;
						case "H": setCode("29");
								break;
					};
					break;
		case "SUB" :checkArg(1,[0]);
					switch(args[0]){
						case "A": setCode("97");
								break;
						case "B": setCode("90");
								break;
						case "C": setCode("91");
								break;
						case "D": setCode("92");
								break;
						case "E": setCode("93");
								break;
						case "H": setCode("94");
								break;
						case "L": setCode("95");
								break;
						case "M": setCode("96");
								break;
						default: throw "Incorrect Parameter!";
					};
					break;
		case "SBB" :checkArg(1,[0]);
					switch(args[0]){
						case "A": setCode("9F");
								break;
						case "B": setCode("98");
								break;
						case "C": setCode("99");
								break;
						case "D": setCode("9A");
								break;
						case "E": setCode("9B");
								break;
						case "H": setCode("9C");
								break;
						case "L": setCode("9D");
								break;
						case "M": setCode("9E");
								break;
						default: throw "Incorrect Parameter!";
					};
					break;
		case "SUI" :checkArg(1,[1]);
					setCode("D6");
					setCode(args[0]);
					break;
		case "SBI" :checkArg(1,[1]);
					setCode("DE");
					setCode(args[0]);
					break;
		case "INR" :checkArg(1,[0]);
					switch(args[0]){
						case "A": setCode("3C");
								break;
						case "B": setCode("04");
								break;
						case "C": setCode("0C");
								break;
						case "D": setCode("14");
								break;
						case "E": setCode("1C");
								break;
						case "H": setCode("24");
								break;
						case "L": setCode("2C");
								break;
						case "M": setCode("34");
								break;
						default: throw "Incorrect Parameter!";
					};
					break;
		case "INX" : checkArg(1,[0]);
					switch(args[0]){
						case "B": setCode("03");
								break;
						case "D": setCode("13");
								break;
						case "H": setCode("23");
								break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "DCR" :checkArg(1,[0]);
					switch(args[0]){
						case "A": setCode("3D");
								break;
						case "B": setCode("05");
								break;
						case "C": setCode("0D");
								break;
						case "D": setCode("15");
								break;
						case "E": setCode("1D");
								break;
						case "H": setCode("25");
								break;
						case "L": setCode("2D");
								break;
						case "M": setCode("35");
								break;
						default: throw "Incorrect Parameter!";
					};
					break;
		case "DCX" :checkArg(1,[0]);
					switch(args[0]){
						case "B": setCode("0B");
								break;
						case "D": setCode("1B");
								break;
						case "H": setCode("2B");
								break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "DAA" :checkArg(0);
					setCode("27");
					break;
		case "MOV" :checkArg(2,[0,0]);
					switch(args[0]){
			case "A": switch(args[1]){
						case "A": setCode("7F");
								break;
						case "B": setCode("78");
								break;
						case "C": setCode("79");
								break;
						case "D": setCode("7A");
								break;
						case "E": setCode("7B");
								break;
						case "H": setCode("7C");
								break;
						case "L": setCode("7D");
								break;
						case "M": setCode("7E");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
				case "B": switch(args[1]){
						case "A": setCode("47");
								break;
						case "B": setCode("40");
								break;
						case "C": setCode("41");
								break;
						case "D": setCode("42");
								break;
						case "E": setCode("43");
								break;
						case "H": setCode("44");
								break;
						case "L": setCode("45");
								break;
						case "M": setCode("46");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
			case "C": switch(args[1]){
						case "A": setCode("4F");
								break;
						case "B": setCode("48");
								break;
						case "C": setCode("49");
								break;
						case "D": setCode("4A");
								break;
						case "E": setCode("4B");
								break;
						case "H": setCode("4C");
								break;
						case "L": setCode("4D");
								break;
						case "M": setCode("4E");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
				case "D": switch(args[1]){
						case "A": setCode("57");
								break;
						case "B": setCode("50");
								break;
						case "C": setCode("51");
								break;
						case "D": setCode("52");
								break;
						case "E": setCode("52");
								break;
						case "H": setCode("53");
								break;
						case "L": setCode("54");
								break;
						case "M": setCode("55");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
				case "E": switch(args[1]){
						case "A": setCode("5F");
								break;
						case "B": setCode("58");
								break;
						case "C": setCode("59");
								break;
						case "D": setCode("5A");
								break;
						case "E": setCode("5B");
								break;
						case "H": setCode("5C");
								break;
						case "L": setCode("5D");
								break;
						case "M": setCode("5E");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
				case "H": switch(args[1]){
						case "A": setCode("67");
								break;
						case "B": setCode("60");
								break;
						case "C": setCode("61");
								break;
						case "D": setCode("62");
								break;
						case "E": setCode("63");
								break;
						case "H": setCode("64");
								break;
						case "L": setCode("65");
								break;
						case "M": setCode("66");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
				case "L": switch(args[1]){
						case "A": setCode("6F");
								break;
						case "B": setCode("68");
								break;
						case "C": setCode("69");
								break;
						case "D": setCode("6A");
								break;
						case "E": setCode("6B");
								break;
						case "H": setCode("6C");
								break;
						case "L": setCode("6D");
								break;
						case "M": setCode("6E");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
				case "M": switch(args[1]){
						case "A": setCode("77");
								break;
						case "B": setCode("70");
								break;
						case "C": setCode("71");
								break;
						case "D": setCode("72");
								break;
						case "E": setCode("73");
								break;
						case "H": setCode("74");
								break;
						case "L": setCode("75");
								break;
						case "M": setCode("76");
								break;
						default: throw "Incorrect Parameter!";
					};
								break;
						default: throw "Incorrect Parameter!";
					};
					break;
		case "MVI" :checkArg(2,[0,1]);
					switch(args[0]){
						case "A": setCode("3E");
								break;
						case "B": setCode("06");
								break;
						case "C": setCode("0E");
								break;
						case "D": setCode("16");
								break;
						case "E": setCode("1E");
								break;
						case "H": setCode("26");
								break;
						case "L": setCode("2E");
								break;
						case "M": setCode("36");
								break;
						default: throw "Incorrect Parameter!";
					};
					setCode(args[1]);
					break;
		case "LDA" :checkArg(1,[2]);
					setCode("3A");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "LDAX" :checkArg(1,[0]);
					 switch(args[0]){
						case "B": setCode("0A");
								break;
						case "D": setCode("1A");
								break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "LHLD" :checkArg(1,[2]);
					 setCode("2A");
					 setCode(args[0].substring(2,4));
					 setCode(args[0].substring(0,2));
					break;
		case "STA" :checkArg(1,[2]);
					setCode("32");
					setCode(args[0].substring(2,4));
					setCode(args[0].substring(0,2));
					break;
		case "STAX" :checkArg(1,[0]);
					 switch(args[0]){
						case "B": setCode("02");
								break;
						case "D": setCode("12");
								break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "SHLD" :checkArg(1,[2]);
					setCode("22");
					setCode(args[0].substring(2,4));
					 setCode(args[0].substring(0,2));
					break;
		case "XCHG" :checkArg(0);
					 setCode("EB");
					break;
		case "SPHL" :checkArg(0);
					 setCode("F9");
					break;
		case "XTHL" :checkArg(0);
					 setCode("E3");
					break;
		case "PUSH" :if(args.length!=1)
						throw "Inappropriate operand!";
					 switch(args[0]){
						case "B": setCode("C5");
								break;
						case "D": setCode("D5");
								break;
						case "H": setCode("E5");
								break;
						case "PSW": setCode("F5");
								break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "POP" :checkArg(1,[0]);
					 switch(args[0]){
						case "B": setCode("C1");
								break;
						case "D": setCode("D1");
								break;
						case "H": setCode("E1");
								break;
						default: throw "Inappropriate parameter!";
					};
					break;
		case "OUT" :checkArg(1,[1]);
					setCode("D3");
					setCode(args[0]);
					break;
		case "IN" : checkArg(1,[1]);
					setCode("DB");
					setCode(args[0]);
					break;
		default: return true;
	}
	return false;
}

function getInstructionCode(){
	var x=getCode();
	switch(x){
		case "76" : instruction="HLT";
				break;
		case "F3" : instruction="DI" ;
				break;
		case "FB" : instruction="EI" ;
				break;
		case "20" : instruction="RIM" ;
				break;
		case "30" : instruction="SIM" ;
				break;
		case "BF" : instruction="CMP" ;
					args[0]="A";
				break;
		case "B8" : instruction="CMP" ;
					args[0]="B";
				break;
		case "B9" : instruction="CMP" ;
					args[0]="C";
				break;
		case "BA" : instruction="CMP" ;
					args[0]="D";
				break;
		case "BB" : instruction="CMP" ;
					args[0]="E";
				break;
		case "BC" : instruction="CMP" ;
					args[0]="H";
				break;
		case "BD" : instruction="CMP" ;
					args[0]="L";
				break;
		case "BE" : instruction="CMP" ;
					args[0]="M";
				break;
		case "FE" : instruction="CPI" ;
					args[0]=getCode();
				break;
		case "A7" : instruction="ANA" ;
					args[0]="A";
				break;
		case "A0" : instruction="ANA" ;
					args[0]="B";
				break;
		case "A1" : instruction="ANA" ;
					args[0]="C";
				break;
		case "A2" : instruction="ANA" ;
					args[0]="D";
				break;
		case "A3" : instruction="ANA" ;
					args[0]="E";
				break;
		case "A4" : instruction="ANA" ;
					args[0]="H";
				break;
		case "A5" : instruction="ANA" ;
					args[0]="L";
				break;
		case "A6" : instruction="ANA" ;
					args[0]="M";
				break;
		case "E6" : instruction="ANI" ;
					args[0]=getCode();
				break;
		case "AF" : instruction="XRA" ;
					args[0]="A";
				break;
		case "A8" : instruction="XRA" ;
					args[0]="B";
				break;
		case "A9" : instruction="XRA" ;
					args[0]="C";
				break;
		case "AA" : instruction="XRA" ;
					args[0]="D";
				break;
		case "AB" : instruction="XRA" ;
					args[0]="E";
				break;
		case "AC" : instruction="XRA" ;
					args[0]="H";
				break;
		case "AD" : instruction="XRA" ;
					args[0]="L";
				break;
		case "AE" : instruction="XRA" ;
					args[0]="M";
				break;
		case "EE" : instruction="XRI" ;
					args[0]=getCode();
				break;
		case "B7" : instruction="ORA" ;
					args[0]="A";
				break;
		case "B0" : instruction="ORA" ;
					args[0]="B";
				break;
		case "B1" : instruction="ORA" ;
					args[0]="C";
				break;
		case "B2" : instruction="ORA" ;
					args[0]="D";
				break;
		case "B3" : instruction="ORA" ;
					args[0]="E";
				break;
		case "B4" : instruction="ORA" ;
					args[0]="H";
				break;
		case "B5" : instruction="ORA" ;
					args[0]="L";
				break;
		case "B6" : instruction="ORA" ;
					args[0]="M";
				break;
		case "F6" : instruction="ORI" ;
					args[0]=getCode();
				break;
		case "07" : instruction="RLC" ;
				break;
		case "0F" : instruction="RRC" ;
				break;
		case "17" : instruction="RAL" ;
				break;
		case "1F" : instruction="RAR" ;
				break;
		case "2F" : instruction="CMA" ;
				break;
		case "3F" : instruction="CMC" ;
				break;
		case "37" : instruction="STC" ;
				break;
		case "C3" : instruction="JMP" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "DA" : instruction="JC" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "D2" : instruction="JNC" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "F2" : instruction="JP" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "FA" : instruction="JM" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "CA" : instruction="JZ" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "C2" : instruction="JNZ" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "EA" : instruction="JPE" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "E2" : instruction="JPO" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "DC" : instruction="CC" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "D4" : instruction="CNC" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "F4" : instruction="CP" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "FC" : instruction="CM" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "CC" : instruction="CZ" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "C4" : instruction="CNZ" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "EC" : instruction="CPE" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "E4" : instruction="CPO" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg;
				break;
		case "C9" : instruction="RET" ;
				break;
		case "D8" : instruction="RC" ;
				break;
		case "D0" : instruction="RNC" ;
				break;
		case "F0" : instruction="RP" ;
				break;
		case "F8" : instruction="RM" ;
				break;
		case "C8" : instruction="RZ" ;
				break;
		case "C0" : instruction="RNZ" ;
				break;
		case "E8" : instruction="RPE" ;
				break;
		case "E0" : instruction="RPO" ;
				break;
		case "E9" : instruction="PCHL" ;
				break;
		case "C7" : instruction="RST" ;
					args[0]="0";
				break;
		case "CF" : instruction="RST" ;
					args[0]="1";
				break;
		case "D7" : instruction="RST" ;
					args[0]="2";
				break;
		case "DF" : instruction="RST" ;
					args[0]="3";
				break;
		case "E7" : instruction="RST" ;
					args[0]="4";
				break;
		case "EF" : instruction="RST" ;
					args[0]="5";
				break;
		case "F7" : instruction="RST" ;
					args[0]="6";
				break;
		case "FF" : instruction="RST" ;
					args[0]="7";
				break;
		case "87" : instruction="ADD" ;
					args[0]="A";
				break;
		case "80" : instruction="ADD" ;
					args[0]="B";
				break;
		case "81" : instruction="ADD" ;
					args[0]="C";
				break;
		case "82" : instruction="ADD" ;
					args[0]="D";
				break;
		case "83" : instruction="ADD" ;
					args[0]="E";
				break;
		case "84" : instruction="ADD" ;
					args[0]="H";
				break;
		case "85" : instruction="ADD" ;
					args[0]="L";
				break;
		case "86" : instruction="ADD" ;
					args[0]="M";
				break;
		case "8F" : instruction="ADC" ;
					args[0]="A";
				break;
		case "88" : instruction="ADC" ;
					args[0]="B";
				break;
		case "89" : instruction="ADC" ;
					args[0]="C";
				break;
		case "8A" : instruction="ADC" ;
					args[0]="D";
				break;
		case "8B" : instruction="ADC" ;
					args[0]="E";
				break;
		case "8C" : instruction="ADC" ;
					args[0]="H";
				break;
		case "8D" : instruction="ADC" ;
					args[0]="L";
				break;
		case "8E" : instruction="ADC" ;
					args[0]="M";
				break;
		case "C6" : instruction="ADI" ;
					args[0]=getCode();
				break;
		case "CE" : instruction="ACI" ;
					args[0]=getCode();
				break;
		case "01" : instruction="LXI" ;
					args[0]="B";
					prevargg=getCode();
					args[1]=getCode();
					args[1]+=prevargg;
				break;
		case "11" : instruction="LXI" ;
					args[0]="D";
					prevargg=getCode();
					args[1]=getCode();
					args[1]+=prevargg;
				break;
		case "21" : instruction="LXI" ;
					args[0]="H";
					prevargg=getCode();
					args[1]=getCode();
					args[1]+=prevargg;
				break;
		case "09" : instruction="DAD" ;
					args[0]="B";
				break;
		case "19" : instruction="DAD" ;
					args[0]="D";
				break;
		case "29" : instruction="DAD" ;
					args[0]="H";
				break;
		case "97" : instruction="SUB" ;
					args[0]="A";
				break;
		case "90" : instruction="SUB" ;
					args[0]="B";
				break;
		case "91" : instruction="SUB" ;
					args[0]="C";
				break;
		case "92" : instruction="SUB" ;
					args[0]="D";
				break;
		case "93" : instruction="SUB" ;
					args[0]="E";
				break;
		case "94" : instruction="SUB" ;
					args[0]="H";
				break;
		case "95" : instruction="SUB" ;
					args[0]="L";
				break;
		case "96" : instruction="SUB" ;
					args[0]="M";
				break;
		case "9F" : instruction="SBB" ;
					args[0]="A";
				break;
		case "98" : instruction="SBB" ;
					args[0]="B";
				break;
		case "99" : instruction="SBB" ;
					args[0]="C";
				break;
		case "9A" : instruction="SBB" ;
					args[0]="D";
				break;
		case "9B" : instruction="SBB" ;
					args[0]="E";
				break;
		case "9C" : instruction="SBB" ;
					args[0]="H";
				break;
		case "9D" : instruction="SBB" ;
					args[0]="L";
				break;
		case "9E" : instruction="SBB" ;
					args[0]="M";
				break;
		case "D6" : instruction="SUI" ;
					args[0]=getCode();
				break;
		case "DE" : instruction="SBB" ;
					args[0]=getCode();
				break;
		case "3C" : instruction="INR" ;
					args[0]="A";
				break;
		case "04" : instruction="INR" ;
					args[0]="B";
				break;
		case "0C" : instruction="INR" ;
					args[0]="C";
				break;
		case "14" : instruction="INR" ;
					args[0]="D";
				break;
		case "1C" : instruction="INR" ;
					args[0]="E";
				break;
		case "24" : instruction="INR" ;
					args[0]="H";
				break;
		case "2C" : instruction="INR" ;
					args[0]="L";
				break;
		case "34" : instruction="INR" ;
					args[0]="M";
				break;
		case "03" : instruction="INX" ;
					args[0]="B";
				break;
		case "13" : instruction="INX" ;
					args[0]="D";
				break;
		case "23" : instruction="INX" ;
					args[0]="H";
				break;
		case "3D" : instruction="DCR" ;
					args[0]="A";
				break;
		case "05" : instruction="DCR" ;
					args[0]="B";
				break;
		case "0D" : instruction="DCR" ;
					args[0]="C";
				break;
		case "15" : instruction="DCR" ;
					args[0]="D";
				break;
		case "1D" : instruction="DCR" ;
					args[0]="E";
				break;
		case "25" : instruction="DCR" ;
					args[0]="H";
				break;
		case "2D" : instruction="DCR" ;
					args[0]="L";
				break;
		case "35" : instruction="DCR" ;
					args[0]="M";
				break;
		case "0B" : instruction="DCX" ;
					args[0]="B";
				break;
		case "1B" : instruction="DCX" ;
					args[0]="D";
				break;
		case "2B" : instruction="DCX" ;
					args[0]="H";
				break;
		case "27" : instruction="DAA" ;
					args[0]="B";
				break;
		case "7F" : instruction="MOV" ;
					args[0]="A";
					args[1]="A";
				break;
		case "78" : instruction="MOV" ;
					args[0]="A";
					args[1]="B";
				break;
		case "79" : instruction="MOV" ;
					args[0]="A";
					args[1]="C";
				break;
		case "7A" : instruction="MOV" ;
					args[0]="A";
					args[1]="D";
				break;
		case "7B" : instruction="MOV" ;
					args[0]="A";
					args[1]="E";
				break;
		case "7C" : instruction="MOV" ;
					args[0]="A";
					args[1]="H";
				break;
		case "7D" : instruction="MOV" ;
					args[0]="A";
					args[1]="L";
				break;
		case "7E" : instruction="MOV" ;
					args[0]="A";
					args[1]="M";
				break;
		case "47" : instruction="MOV" ;
					args[0]="B";
					args[1]="A";
				break;
		case "40" : instruction="MOV" ;
					args[0]="B";
					args[1]="B";
				break;
		case "41" : instruction="MOV" ;
					args[0]="B";
					args[1]="C";
				break;
		case "42" : instruction="MOV" ;
					args[0]="B";
					args[1]="D";
				break;
		case "43" : instruction="MOV" ;
					args[0]="B";
					args[1]="E";
				break;
		case "44" : instruction="MOV" ;
					args[0]="B";
					args[1]="H";
				break;
		case "45" : instruction="MOV" ;
					args[0]="B";
					args[1]="L";
				break;
		case "46" : instruction="MOV" ;
					args[0]="B";
					args[1]="M";
				break;
		case "4F" : instruction="MOV" ;
					args[0]="C";
					args[1]="A";
				break;
		case "48" : instruction="MOV" ;
					args[0]="C";
					args[1]="B";
				break;
		case "49" : instruction="MOV" ;
					args[0]="C";
					args[1]="C";
				break;
		case "4A" : instruction="MOV" ;
					args[0]="C";
					args[1]="D";
				break;
		case "4B" : instruction="MOV" ;
					args[0]="C";
					args[1]="E";
				break;
		case "4C" : instruction="MOV" ;
					args[0]="C";
					args[1]="H";
				break;
		case "4D" : instruction="MOV" ;
					args[0]="C";
					args[1]="L";
				break;
		case "4E" : instruction="MOV" ;
					args[0]="C";
					args[1]="M";
				break;
		case "57" : instruction="MOV" ;
					args[0]="D";
					args[1]="A";
				break;
		case "50" : instruction="MOV" ;
					args[0]="D";
					args[1]="B";
				break;
		case "51" : instruction="MOV" ;
					args[0]="D";
					args[1]="C";
				break;
		case "52" : instruction="MOV" ;
					args[0]="D";
					args[1]="D";
				break;
		case "53" : instruction="MOV" ;
					args[0]="D";
					args[1]="E";
				break;
		case "54" : instruction="MOV" ;
					args[0]="D";
					args[1]="H";
				break;
		case "55" : instruction="MOV" ;
					args[0]="D";
					args[1]="L";
				break;
		case "56" : instruction="MOV" ;
					args[0]="D";
					args[1]="M";
				break;
		case "5F" : instruction="MOV" ;
					args[0]="E";
					args[1]="A";
				break;
		case "58" : instruction="MOV" ;
					args[0]="E";
					args[1]="B";
				break;
		case "59" : instruction="MOV" ;
					args[0]="E";
					args[1]="C";
				break;
		case "5A" : instruction="MOV" ;
					args[0]="E";
					args[1]="D";
				break;
		case "5B" : instruction="MOV" ;
					args[0]="E";
					args[1]="E";
				break;
		case "5C" : instruction="MOV" ;
					args[0]="E";
					args[1]="H";
				break;
		case "5D" : instruction="MOV" ;
					args[0]="E";
					args[1]="L";
				break;
		case "5E" : instruction="MOV" ;
					args[0]="E";
					args[1]="M";
				break;
		case "67" : instruction="MOV" ;
					args[0]="H";
					args[1]="A";
				break;
		case "60" : instruction="MOV" ;
					args[0]="H";
					args[1]="B";
				break;
		case "61" : instruction="MOV" ;
					args[0]="H";
					args[1]="C";
				break;
		case "62" : instruction="MOV" ;
					args[0]="H";
					args[1]="D";
				break;
		case "63" : instruction="MOV" ;
					args[0]="H";
					args[1]="E";
				break;
		case "64" : instruction="MOV" ;
					args[0]="H";
					args[1]="H";
				break;
		case "65" : instruction="MOV" ;
					args[0]="H";
					args[1]="L";
				break;
		case "66" : instruction="MOV" ;
					args[0]="H";
					args[1]="M";
				break;
		case "6F" : instruction="MOV" ;
					args[0]="L";
					args[1]="A";
				break;
		case "68" : instruction="MOV" ;
					args[0]="L";
					args[1]="B";
				break;
		case "69" : instruction="MOV" ;
					args[0]="L";
					args[1]="C";
				break;
		case "6A" : instruction="MOV" ;
					args[0]="L";
					args[1]="D";
				break;
		case "6B" : instruction="MOV" ;
					args[0]="L";
					args[1]="E";
				break;
		case "6C" : instruction="MOV" ;
					args[0]="L";
					args[1]="H";
				break;
		case "6D" : instruction="MOV" ;
					args[0]="L";
					args[1]="L";
				break;
		case "6E" : instruction="MOV" ;
					args[0]="L";
					args[1]="M";
				break;
		case "77" : instruction="MOV" ;
					args[0]="M";
					args[1]="A";
				break;
		case "70" : instruction="MOV" ;
					args[0]="M";
					args[1]="B";
				break;
		case "71" : instruction="MOV" ;
					args[0]="M";
					args[1]="C";
				break;
		case "72" : instruction="MOV" ;
					args[0]="M";
					args[1]="D";
				break;
		case "73" : instruction="MOV" ;
					args[0]="M";
					args[1]="E";
				break;
		case "74" : instruction="MOV" ;
					args[0]="M";
					args[1]="H";
				break;
		case "75" : instruction="MOV" ;
					args[0]="M";
					args[1]="L";
				break;
		case "76" : instruction="MOV" ;
					args[0]="M";
					args[1]="M";
				break;
		case "3E" : instruction="MVI" ;
					args[0]="A";
					args[1]=getCode();
				break;
		case "06" : instruction="MVI" ;
					args[0]="B";
					args[1]=getCode();
				break;
		case "0E" : instruction="MVI" ;
					args[0]="C";
					args[1]=getCode();
				break;
		case "16" : instruction="MVI" ;
					args[0]="D";
					args[1]=getCode();
				break;
		case "1E" : instruction="MVI" ;
					args[0]="E";
					args[1]=getCode();
				break;
		case "26" : instruction="MVI" ;
					args[0]="H";
					args[1]=getCode();
				break;
		case "2E" : instruction="MVI" ;
					args[0]="L";
					args[1]=getCode();
				break;
		case "36" : instruction="MVI" ;
					args[0]="M";
					args[1]=getCode();
				break;
		case "3A" : instruction="LDA" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg();
				break;
		case "0A" : instruction="LDAX" ;
					args[0]="B";
				break;
		case "1A" : instruction="LDAX" ;
					args[0]="D";
				break;
		case "2A" : instruction="LHLD" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg();
				break;
		case "32" : instruction="STA" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg();
				break;
		case "02" : instruction="STAX" ;
					args[0]="B";
				break;
		case "12" : instruction="STAX" ;
					args[0]="D";
				break;
		case "22" : instruction="SHLD" ;
					prevargg=getCode();
					args[0]=getCode();
					args[0]+=prevargg();
				break;
		case "EB" : instruction="XCHG" ;
				break;
		case "F9" : instruction="SPHL" ;
				break;
		case "E3" : instruction="XTHL" ;
				break;
		case "C5" : instruction="PUSH" ;
					args[0]="B";
				break;
		case "D5" : instruction="PUSH" ;
					args[0]="D";
				break;
		case "E5" : instruction="PUSH" ;
					args[0]="H";
				break;
		case "F5" : instruction="PUSH" ;
					args[0]="PSW";
				break;
		case "C1" : instruction="POP" ;
					args[0]="B";
				break;
		case "D1" : instruction="POP" ;
					args[0]="D";
				break;
		case "E1" : instruction="POP" ;
					args[0]="H";
				break;
		case "D3" : instruction="OUT" ;
					args[0]=getCode();
				break;
		case "DB" : instruction="IN" ;
					args[0]=getCode();
				break;
	}
}

function getCode(){
	var re=Memory[PC];
	PC++;
	return re;
}

function dec_to_hex(x,lengt=null){
	var num=x;
			var img="";
			var l=0;
			for(var i=num%16;;++l,num=(num-i)/16,i=num%16){
				if(i<10)
					img+=""+i;
					else switch(i){
						case 10: img+="A";
								break;
						case 11: img+="B";
								break;
						case 12: img+="C";
								break;
						case 13: img+="D";
								break;
						case 14: img+="E";
								break;
						case 15: img+="F";
								break;
						
					};
				if(num<16)
					break;
			}
	var R=(""+img);
	var Ans="";
	for(var l=R.length-1;l>=0;--l)
		Ans+=R[l];
	if(lengt==null)
	return Ans;
	for(var i=Ans.length;i<lengt;++i)
			Ans="0"+Ans;
		return Ans;
}

function getM(){
	M=getMemory(H+L);
	return M;
}

function setM(){
	Memory[hex_to_dec(H+L)]=M;
}

function dcrHex(hex, size=null){
		var res=hex_to_dec(hex)-1;
		if(res<0){
			sign_flag=1;
			if(size==null)
		return hex=("F").repeat(hex.length);
	else return hex=("F").repeat(size);
		}
	return hex=dec_to_hex(res,size);
}

function incHex(hex,size=null){
	return hex=dec_to_hex(hex_to_dec(hex)+1,size);
}
//instuuctions: 

function DI(){
	IE=0;
}

function EI(){
	IE=1;
}

function RIM(){
	A=dec_to_hex((new Binary(""+SID+I7_5+I6_5+I5_5+IE+M7_5+M6_5+M5_5)).toDecimal());
}

function SIM(){
	var info=new Binary(hex_to_dec(A),8);
	SOD=info.value[7];
	SDE=info.value[6];
	R7_5=info.value[4];
	MSE=info.value[3];
	M7_5=info.value[2];
	M6_5=info.value[1];
	M5_5=info.value[0];
}

function CMP(){
	var arg;
	switch(args[0]){
		case "A": zero_flag=1;
					carry_flag=0;
					return;
		case "B": arg=B;
				break;
		case "C": arg=C;
				break;
		case "D": arg=D;
				break;
		case "E": arg=E;
				break;
		case "H": arg=H;
				break;
		case "L": arg=L;
				break;
		case "M": arg=getM();
				break;
	}
	if (A==arg){
		zero_flag=1;
		carry_flag=0;
	}else if(hex_to_dec(A)<hex_to_dec(arg)){
		carry_flag=1;
		zero_flag=0;
	}else if(hex_to_dec(A)>hex_to_dec(arg)){
		carry_flag=0;
		zero_flag=0;
}
}

function CPI(){
	var bip=true;
	if (A==args[0]){
		zero_flag=1;
		carry_flag=0;
		parity_flag=1;
		auxillary_carry_flag=1;
	}else{
	if(hex_to_dec(A)<hex_to_dec(args[0])){
		carry_flag=1;
		zero_flag=0;
		auxillary_carry_flag=0;
		sign_flag=1;
	}else if(hex_to_dec(A)>hex_to_dec(args[0])){
		carry_flag=0;
		zero_flag=0;
		auxillary_carry_flag=1;
		sign_flag=0;
		}
		binnum=hex_to_dec(A)-hex_to_dec(args[0]);
		if(binnum==-1)
			parity_flag=1;
		else{
		var bin=new Binary(Math.abs(binnum));
		var bins=bin.print();
		for(var i=0,l=bins.length;i<l;++i)
			if(bins[i]=='1'){
				if(bip)
					bip=false;
				else bip=true;
			}
		if(bip)
		parity_flag=1;
		else parity_flag=0;
		}
	}
}

function ANA(){
	var arg;
	switch(args[0]){
		case "A": arg=A;
				break;
		case "B": arg=B;
				break;
		case "C": arg=C;
				break;
		case "D": arg=D;
				break;
		case "E": arg=E;
				break;
		case "H": arg=H;
				break;
		case "L": arg=L;
				break;
		case "M": arg=getM();
				break;
	}
	args[0]=arg;
	ANI();
}

function ANI(){
	var arg1=new Binary(hex_to_dec(A),8);
	var arg2=new Binary(hex_to_dec(args[0]),8);
	arg1.AND(arg2);
	A=dec_to_hex(arg1.toDecimal());
	pendingCheck='A';
}

function XRA(){
	var arg;
	switch(args[0]){
		case "A": arg=A;
				break;
		case "B": arg=B;
				break;
		case "C": arg=C;
				break;
		case "D": arg=D;
				break;
		case "E": arg=E;
				break;
		case "H": arg=H;
				break;
		case "L": arg=L;
				break;
		case "M": arg=getM();
				break;
	}
	args[0]=arg;
	XRI();
}

function XRI(){
	var arg1=new Binary(hex_to_dec(A),8);
	var arg2=new Binary(hex_to_dec(args[0]),8);
	arg1.XOR(arg2);
	A=dec_to_hex(arg1.toDecimal());
	pendingCheck='A';
}

function ORA(){
	var arg;
	switch(args[0]){
		case "A": arg=A;
				break;
		case "B": arg=B;
				break;
		case "C": arg=C;
				break;
		case "D": arg=D;
				break;
		case "E": arg=E;
				break;
		case "H": arg=H;
				break;
		case "L": arg=L;
				break;
		case "M": arg=getM();
				break;
	}
	args[0]=arg;
	ORI();
}

function ORI(){
	var arg1=new Binary(hex_to_dec(A),8);
	var arg2=new Binary(hex_to_dec(args[0]),8);
	arg1.OR(arg2);
	A=dec_to_hex(arg1.toDecimal());
	pendingCheck='A';
}

function RLC(){
	var orginalh=new Binary(hex_to_dec(A.charAt(0)),4);
	var orginall=new Binary(hex_to_dec(A.charAt(1)),4);
	var original=Binary.concate(orginalh,orginall);
	var res="";
	var a=original.value[0];
	for(var i=0;i<7;++i)
		original.value[i]=original.value[i+1];
	original.value[7]=a;
	A=dec_to_hex(original.toDecimal());
}

function RRC(){
	var orginalh=new Binary(hex_to_dec(A.charAt(0)),4);
	var orginall=new Binary(hex_to_dec(A.charAt(1)),4);
	var original=Binary.concate(orginalh,orginall);
	var res="";
	var a=original.value[7];
	for(var i=7;i>0;--i)
		original.value[i]=original.value[i-1];
	original.value[0]=a;
	A=dec_to_hex(original.toDecimal());
}

function RAL(){
	var orginalh=new Binary(hex_to_dec(A.charAt(0)),4);
	var orginall=new Binary(hex_to_dec(A.charAt(1)),4);
	var original=Binary.concate(orginalh,orginall);
	var res="";
	for(var i=0;i<7;++i)
		original.value[i]=original.value[i+1];
	original.value[7]=carry_flag;
	A=dec_to_hex(original.toDecimal());
}

function RAR(){
	var orginalh=new Binary(hex_to_dec(A.charAt(0)),4);
	var orginall=new Binary(hex_to_dec(A.charAt(1)),4);
	var original=Binary.concate(orginalh,orginall);
	var res="";
	for(var i=7;i>0;--i)
		original.value[i]=original.value[i-1];
	original.value[0]=carry_flag;
	A=dec_to_hex(original.toDecimal());
}

function CMA(){
	var res=new Binary(hex_to_dec(A),8);
	res.Compliment();
	A=dec_to_hex(res.toDecimal());
}

function CMC(){
	if(carry_flag==1)
		carry_flag=0;
	else carry_flag=1;
}

function STC(){
	carry_flag=1;
}

function JMP(){
	PC=hex_to_dec(args[0]);
}

function JC(){
	if(carry_flag==1)
		JMP();
}

function JNC(){
	if(carry_flag==0)
		JMP();
}

function JP(){
	if(sign_flag==0)
		JMP();
}

function JM(){
	if(sign_flag==1)
		JMP();
}

function JZ(){
	if(zero_flag==1)
		JMP();
}

function JNZ(){
	if(zero_flag==0)
		JMP();
}

function JPE(){
	if(parity_flag==1)
		JMP();
}

function JPO(){
	if(parity_flag==0)
		JMP();
}

function CALL(){
	Stack_pointer=dcrHex(Stack_pointer);
	var mem=dec_to_hex(PC+3,4);
	setMemory(Stack_pointer,mem.substring(0,2));
	Stack_pointer=dcrHex(Stack_pointer);
	setMemory(Stack_pointer,mem.substring(2,4));
	PC=hex_to_dec(args[0]);
}

function CC(){
	if(carry_flag==1)
		CALL();
}

function CNC(){
	if(carry_flag==0)
		CALL();
}

function CP(){
	if(sign_flag==0)
		CALL();
}

function CM(){
	if(sign_flag==1)
		CALL();
}

function CZ(){
	if(zero_flag==1)
		CALL();
}

function CNZ(){
	if(zero_flag==0)
		CALL();
}

function CPE(){
	if(parity_flag==1)
		CALL();
}

function CPO(){
	if(parity_flag==0)
		CALL();
}

function RET(){
	mem=getMemory(Stack_pointer);
	Stack_pointer=incHex(Stack_pointer,4);
	mem+=getMemory(Stack_pointer);
	Stack_pointer=incHex(Stack_pointer,4);
	PC=hex_to_dec(mem);
	if(Stack_pointer.length==5)
		Stack_pointer="0000";
}

function RC(){
	if(carry_flag==1)
		RET();
}

function RNC(){
	if(carry_flag==0)
		RET();
}

function RP(){
	if(sign_flag==0)
		RET();
}

function RM(){
	if(sign_flag==1)
		RET();
}

function RZ(){
	if(zero_flag==1)
		RET();
}

function RNZ(){
	if(zero_flag==0)
		RET();
}

function RPE(){
	if(parity_flag==1)
		RET();
}

function RPO(){
	if(parity_flag==0)
		RET();
}

function PCHL(){
	PC=hex_to_dec(H+L);
}

function RST(){
	switch(args[0]){
		case 0: PC=0;
				break;
		case 1: PC=8;
				break;
		case 2: PC=16;
				break;
		case 3: PC=24;
				break;
		case 4: PC=32;
				break;
		case 5: PC=40;
				break;
		case 6: PC=48;
				break;
		case 7: PC=56;
				break;
	}
}

function ADD(){
	if(args.length!=1)
		throw "Inappropriate parameters!";
	var arg;
	switch(args[0]){
		case 'A': arg=A;
		break;
		case 'B': arg=B;
		break;
		case 'C': arg=C;
		break;
		case 'D': arg=D;
		break;
		case 'E': arg=E;
		break;
		case 'H': arg=H;
		break;
		case 'L': arg=L;
		break;
		case 'M': arg=getM();
		break;
		default: throw "Inappropriate parameters!";
	}
	A=dec_to_hex(hex_to_dec(A)+hex_to_dec(arg));
	if(A.length==3){
		carry_flag=1;
		A=A.substring(1,3);
	}
	pendingCheck='A';
}

function ADC(){
	if(args.length!=1)
		throw "Inappropriate parameters!";
	var arg;
	switch(args[0]){
		case 'A': arg=A;
		break;
		case 'B': arg=B;
		break;
		case 'C': arg=C;
		break;
		case 'D': arg=D;
		break;
		case 'E': arg=E;
		break;
		case 'H': arg=H;
		break;
		case 'L': arg=L;
		break;
		case 'M': arg=getM();
		break;
		default: throw "Inappropriate parameters!";
	}
	A=dec_to_hex(hex_to_dec(A)+hex_to_dec(arg)+carry_flag);
	if(A.length==3){
		carry_flag=1;
		A=A.substring(1,3);
	}
	pendingCheck='A';
}
	
function ADI(){
	A=dec_to_hex(hex_to_dec(A)+hex_to_dec(args[0]));
	if(A.length==3){
		carry_flag=1;
		A=A.substring(1,3);
	}
	pendingCheck='A';
}

function ACI(){
	A=dec_to_hex(hex_to_dec(A)+hex_to_dec(args[0])+carry_flag);
	if(A.length==3){
		carry_flag=1;
		A=A.substring(1,3);
	}
	pendingCheck='A';
}

function DAD(){
	switch(args[0]){
		case "B": par1=hex_to_dec(B+C);
				 par2=hex_to_dec(H+L);
				 par1+=par2;
				 res=dec_to_hex(par1,4);
				 if(res.length==5){
					 carry_flag=1;
					 res=res.substring(1,5);
				 }
				 H=res.substring(0,2);
				 L=res.substring(2,4);
				 break;
		
		case "D": par1=hex_to_dec(D+E);
				 par2=hex_to_dec(H+L);
				 par1+=par2;
				 res=dec_to_hex(par1,4);
				 if(res.length==5){
					 carry_flag=1;
					 res=res.substring(1,5);
				 }
				 H=res.substring(0,2);
				 L=res.substring(2,4);
				break;
		case "H": par1=hex_to_dec(H+L);
				 par2=hex_to_dec(H+L);
				 par1+=par2;
				 res=dec_to_hex(par1,4);
				 if(res.length==5){
					 carry_flag=1;
					 res=res.substring(1,5);
				 }
				 H=res.substring(0,2);
				 L=res.substring(2,4);
				 break;
	}
}

function SUB(){
	if(args.length!=1)
		throw "Inappropriate parameters!";
	var arg;
	switch(args[0]){
		case 'A': arg=A;
		break;
		case 'B': arg=B;
		break;
		case 'C': arg=C;
		break;
		case 'D': arg=D;
		break;
		case 'E': arg=E;
		break;
		case 'H': arg=H;
		break;
		case 'L': arg=L;
		break;
		case 'M': arg=getM();
		break;
		default: throw "Inappropriate parameters!";
	}
	var An=hex_to_dec(A)-hex_to_dec(arg);
	if(An<0){
		A=dec_to_hex(256+An);
		sign_flag=1;
	}
	else A=dec_to_hex(An);
	pendingCheck='A';
}

function SBB(){
	if(args.length!=1)
		throw "Inappropriate parameters!";
	var arg;
	switch(args[0]){
		case 'A': arg=A;
		break;
		case 'B': arg=B;
		break;
		case 'C': arg=C;
		break;
		case 'D': arg=D;
		break;
		case 'E': arg=E;
		break;
		case 'H': arg=H;
		break;
		case 'L': arg=L;
		break;
		case 'M': arg=getM();
		break;
		default: throw "Inappropriate parameters!";
	}
	var An=hex_to_dec(A)-hex_to_dec(arg)-sign_flag;
	if(An<0){
		A=dec_to_hex(256+An);
		sign_flag=1;
	}
	else A=dec_to_hex(An);
	pendingCheck='A';
}

function SUI(){
	var An=hex_to_dec(A)-hex_to_dec(args[0]);
	if(An<0){
		A=dec_to_hex(256+An);
		sign_flag=1;
	}
	else A=dec_to_hex(An);
	pendingCheck='A';
}

function SBI(){
	var An=hex_to_dec(A)+hex_to_dec(args[0])-sign_flag;
	if(An<0){
		A=dec_to_hex(256+An);
		sign_flag=1;
	}
	else A=dec_to_hex(An);
	pendingCheck='A';
}

function INR(){
	switch(args[0]){
		case 'A': tem=incHex(A,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					A=tem;
		break;
		case 'B': tem=incHex(B,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					B=tem;
		break;
		case 'C': tem=incHex(C,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					C=tem;
		break;
		case 'D': tem=incHex(D,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					D=tem;
		break;
		case 'E': tem=incHex(E,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					E=tem;
		break;
		case 'H': tem=incHex(H,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					H=tem;
		break;
		case 'L': tem=incHex(L,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					L=tem;
		break;
		case 'M': tem=incHex(M,2);
					if(tem.length==3){
						sign_flag=1;
						tem=tem.substring(1,3);
					}
					M=tem;
				 setM();
		break;
		default: throw "Inappropriate parameters!";
	}
	pendingCheck=args[0];
}

function INX(){
	var arg;
	switch(args[0]){
		case 'B': arg=B+C;
					arg=incHex(arg);
					if(arg.length==5)
						arg="0000";
					B=arg.substring(0,2);
					C=arg.substring(2,4);
		break;
		case 'D': arg=D+E;
					arg=incHex(arg);
					if(arg.length==5)
						arg="0000";
					D=arg.substring(0,2);
					E=arg.substring(2,4);
		break;
		case 'H':  arg=H+L;
					arg=incHex(arg);
					if(arg.length==5)
						arg="0000";
					H=arg.substring(0,2);
					L=arg.substring(2,4);
		break;
		default: throw "Inappropriate parameters!";
	}
}

function DCR(){
	switch(args[0]){
		case 'A': if(A=="00"){
			sign_flag=1;
			A="FF";
		}
				else A=dcrHex(A,2);
		break;
		case 'B': if(B=="00"){
			sign_flag=1;
			B="FF";
		}
				else B=dcrHex(B,2);
		break;
		case 'C': if(C=="00"){
			sign_flag=1;
			C="FF";
		}
				else C=dcrHex(C,2);
		break;
		case 'D': if(D=="00"){
			sign_flag=1;
			D="FF";
		}
				else D=dcrHex(D,2);
		break;
		case 'E':if(E=="00"){
			sign_flag=1;
			E="FF";
		} 
				else E=dcrHex(E,2);
		break;
		case 'H': if(H=="00"){
			sign_flag=1;
			H="FF";
		}
				else H=dcrHex(H,2);
		break;
		case 'L': if(L=="00"){
			sign_flag=1;
			L="FF";
		}
				else L=dcrHex(L,2);
		break;
		case 'M': if(M=="00"){
			sign_flag=1;
			M="FF";
		}
			else M=dcrHex(M,2); 
				 setM();
		break;
		default: throw "Inappropriate parameters!";
	}
	pendingCheck=args[0];
}

function DCX(){
	var arg;
	switch(args[0]){
		case 'B': arg=B+C;
					arg=dcrHex(arg);
					
					B=arg.substring(0,2);
					C=arg.substring(2,4);
		break;
		case 'D': arg=D+E;
					arg=dcrHex(arg);
					
					D=arg.substring(0,2);
					E=arg.substring(2,4);
		break;
		case 'H':  arg=H+L;
					arg=dcrHex(arg);
					H=arg.substring(0,2);
					L=arg.substring(2,4);
		break;
		default: throw "Inappropriate parameters!";
	}
}

function DAA(){
	var h=A.charAt(0);
	var l=A.charAt(1);
	switch(l){
		case 'A': h=incHex(h);
					l='0';
					break;
		case 'B': h=incHex(h);
					l='1';
					break;
		case 'C': h=incHex(h);
					l='2';
					break;
		case 'D': h=incHex(h);
					l='3';
					break;
		case 'E': h=incHex(h);
					l='4';
					break;
		case 'F': h=incHex(h);
					l='5';
					break;
	};
	switch(h){
		case 'A':	l='0';
					carry_flag=1;
					break;
		case 'B':  l='1';
					carry_flag=1;
					break;
		case 'C': h='2';carry_flag=1;
					break;
		case 'D': h='3';carry_flag=1;
					break;
		case 'E': h='4';carry_flag=1;
					break;
		case 'F': h='5';carry_flag=1;
					break;
	};
	A=h+l;
	pendingCheck='A';
}

function MOV(){
	switch(args[1]){
		case 'A': arg=A;
		break;
		case 'B': arg=B;
		break;
		case 'C': arg=C;
		break;
		case 'D': arg=D;
		break;
		case 'E': arg=E;
		break;
		case 'H': arg=H;
		break;
		case 'L': arg=L;
		break;
		case 'M': getM();
					arg=M;
		break;
		default: throw "Inappropriate parameters!";
	}
	if(args[0]=='M'){
	M=arg;
	setM();
	}
	else switch(args[0]){
		case 'A': A=arg;
		break;
		case 'B': B=arg;
		break;
		case 'C': C=arg;
		break;
		case 'D': D=arg;
		break;
		case 'E': E=arg;
		break;
		case 'H': H=arg;
		break;
		case 'L': L=arg;
		break;
		default: throw "Inappropriate parameters!";
	}
}

function MVI(){
	if(args[1][args.length-1]=='H')
		args[1][args.length-1]='';
	switch(args[0]){
		case 'A': A=args[1];
		break;
		case 'B': B=args[1];
		break;
		case 'C': C=args[1];
		break;
		case 'D': D=args[1];
		break;
		case 'E': E=args[1];
		break;
		case 'H': H=args[1];
		break;
		case 'L': L=args[1];
		break;
		case 'M': M=args[1];
		break;
		default: throw "Inappropriate parameters!";
	}
}

function LDA(){
	A=getMemory(args[0]);
}

function LDAX(){
	var arg;
	switch(args[0]){
		case 'B': arg=B+C;
					A=Memory[hex_to_dec(arg)];
		break;
		case 'D': arg=D+E;
					A=Memory[hex_to_dec(arg)];
		break;
		case 'H':  arg=H+L;
					A=Memory[hex_to_dec(arg)];
		break;
		default: throw "Inappropriate parameters!";
	}
}

function LXI(){
	switch(args[0]){
		case "B": B=args[1].substring(0,2) ;
					C=args[1].substring(2,4);
					break;
		case "D":  D=args[1].substring(0,2) ;
					E=args[1].substring(2,4);
				break;
		case "H": H=args[1].substring(0,2) ;
					L=args[1].substring(2,4);
				break;
	}
}

function LHLD(){
	L=getMemory(args[0]);
	args[0]=incHex(args[0]);
	H=getMemory(args[0]);
	
}

function STA(){
	setMemory(args[0],A);
}

function STAX(){
	var arg;
	switch(args[0]){
		case "B": arg=B+C;
				break;
		case "D": arg=D+E;
				break;
		case "H":arg=H+L;
				break;
	}
	setMemory[arg,A];
}

function SHLD(){
	setMemory(args[0],L);
	setMemory(incHex(args[0]),H);
}

function XCHG(){
	var temp1=H;
	var temp2=L;
	H=D;
	L=E;
	D=temp1;
	E=temp2;
}

function SPHL(){
	args[0]=H;
	PUSH();
}

function XTHL(){
	L=getMemory(Stack_pointer);
	Stack_pointer=incHex(Stack_pointer);
	H=getMemory(Stack_pointer);
	Stack_pointer=incHex(Stack_pointer);
}

function PUSH(){
	if(Stack_pointer=="0000")
		Stack_pointer="FFFF";
	else Stack_pointer=dcrHex(Stack_pointer);
	switch(args[0]){
		case "B":setMemory(Stack_pointer,B);
				Stack_pointer=dcrHex(Stack_pointer);
				setMemory(Stack_pointer,C);
				break;
		case "D":setMemory(Stack_pointer,D); 
				Stack_pointer=dcrHex(Stack_pointer);
				setMemory(Stack_pointer,E); 
				break;
		case "H":setMemory(Stack_pointer,H); 
				Stack_pointer=dcrHex(Stack_pointer);
				setMemory(Stack_pointer,L); 
				break;
		case "PSW": setMemory(Stack_pointer,PSW.substring(0,2)); 
				Stack_pointer=dcrHex(Stack_pointer);
				setMemory(Stack_pointer,PSW.substring(2,4)); 
	}
}

function POP(){
	var arg;
	switch(args[0]){
		case "B": arg=getMemory(Stack_pointer);
				Stack_pointer=incHex(Stack_pointer,4);
				arg+=getMemory(Stack_pointer); 
				Stack_pointer=incHex(Stack_pointer,4);
				B=arg.substring(0,2);
				C=arg.substring(2,4);
				break;
		case "D":arg=getMemory(Stack_pointer);
				Stack_pointer=incHex(Stack_pointer,4);
				arg+=getMemory(Stack_pointer); 
				Stack_pointer=incHex(Stack_pointer,4);
				D=arg.substring(0,2);
				E=arg.substring(2,4);
				break;
		case "H":arg=getMemory(Stack_pointer); 
				Stack_pointer=incHex(Stack_pointer,4);
				arg+=getMemory(Stack_pointer); 
				Stack_pointer=incHex(Stack_pointer,4);
				H=arg.substring(0,2);
				L=arg.substring(2,4);
				break;
	}
	if(Stack_pointer.length==5)
		Stack_pointer="0000";
}

function OUT(){
	setIOMemory(args[0],A);
}

function IN(){
	A=getIOMemory(args[0]);
}