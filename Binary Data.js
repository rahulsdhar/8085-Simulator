class Binary{
	constructor(x,lengt=null){
		var typ=typeof(x);
		if(typ=="object"){
			this.value=new Array(x.length);
			for(i=0,k=x.length;i<k;++i)
				this.value[i]=x[i];
		}
		else if(typ=="string"){
			this.value=new Array(x.length);
			for(var i=0,k=x.length;i<k;++i){
				this.value[i]=parseInt(x.charAt(i));
				if(isNaN(this.value[i]))
					throw alert("Not a Number!");
			}
		}
		else if(typ=="number"){
			var num=x;
			var img=new Array();
			var l=0;
			for(var i=num%2;;++l,num=(num-i)/2,i=num%2){
				img[l]=i;
				if(num<2)
					break;
			}
			this.value=new Array();
			var j=0;
			if(lengt!=null&&lengt>(l+1)){
				j=lengt-l-1;
				for(var i=0;i<j;++i)
					this.value[i]=0;
			}
			for(var i=0,m=l+1;i<m;++i,++j)
				this.value[j]=img[l-i];
		}
		if(lengt!=null)
			for(var i=this.value.length;i<lengt;++i)
			this.value[i]=0;
	}
	
	increment(){
		var c;
		if(this.value[this.value.length-1]==1){
			this.value[this.value.length-1]=0;
			c=1;
		}
		else{
		this.value[this.value.length-1]=1;
		c=0;
		}
			for(var i=this.value.length-2;i>-1;--i){
				if(c==0)
					break;
				if(this.value[i]==0){
						this.value[i]=1;
						c=0;
				}
				else{
					this.value[i]=0;
					c=1;
				}
				if(i==0&&c==1&&this.value[i]==0){
					this.value[0]=1;
					for(var j=1,k=this.value.length+1;j<k;++j)
						this.value[j]=0;
				}
			}
	}
	
	greyCode(){
		var a=new Binary(this.value);
		for(var i=1,k=this.value.length;i<k;++i)
		a.value[i]=(this.value[i]+this.value[i-1])%2;
		return a;
	}
	
	toDecimal(){
		var a=0;
		for(var i=0,k=this.value.length,l=k-1;i<k;++i,--l)
			if(this.value[i]==1)
				a+=Math.pow(2,l);
		return a;
	}
	
	static concate(a,b){
		var al=a.value.length;
		var bl=b.value.length;
		var c=new Array(al+bl);
		for(var i=0;i<al;++i)
			c[i]=a.value[i];
		for(var i=al,j=0,k=al+bl;i<k;++i,++j)
			c[i]=b.value[j];
		return new Binary(c);
	}
	
	split(x){
			var l=this.value.length;
			if(isNaN(x)||l-x<0||x<0)
				throw alert("Technical Problem!");
			var a1=new Array(x);
			var b1=new Array(l-x);
			for(var i=0;i<x;i++)
				a1[i]=this.value[i];
			for(var i=x,j=0;i<l;++i,++j)
				b1[j]=this.value[i];
			return [new Binary(a1),new Binary(b1)];
	}
	
	print(nm=null){
		var log="";
		for(var i=0,k=this.value.length;i<k;++i)
			log+=this.value[i].toString();
		if(nm==null)
		return log;
		for(var i=log.length;i<nm;++i)
			log="0"+log;
		return log;
	}
	
	AND(X){
		var nvalue=new Array();
		for(var i=0,l=X.value.length;i<l;++i){
			if(X.value[i]==1&&this.value[i]==1)
				nvalue[i]=1;
			else nvalue[i]=0;
		}
		this.value=nvalue;
	}
	
	OR(X){
		var nvalue=new Array();
		for(var i=0,l=X.value.length;i<l;++i){
			if(X.value[i]==1||this.value[i]==1)
				nvalue[i]=1;
			else nvalue[i]=0;
		}
		this.value=nvalue;
	}
	
	XOR(X){
		var nvalue=new Array();
		for(var i=0,l=X.value.length;i<l;++i){
			if((X.value[i]==1&&this.value[i]==1)||(X.value[i]==0&&this.value[i]==0))
				nvalue[i]=0;
			else nvalue[i]=1;
		}
		this.value=nvalue;
	}
	Compliment(len=null){
		for(var i=0,l=this.value.length;i<l;++i)
			if(this.value[i]==1)
				this.value[i]=0;
			else this.value[i]=1;
			if(len!=null)
				for(var i=this.value.length;i<len;++i)
					this.value[i]=1;
	}
	print_console(){
		console.log(this.print());
	}
}